"""
MCP Tool: delete_task

Deletes a task using fuzzy title matching.
"""
import asyncio
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from ..server import mcp
from ...services.task_service import TaskService
from ...utils.task_matching import fuzzy_match_task


class DeleteTaskInput(BaseModel):
    """Input schema for delete_task tool."""
    model_config = ConfigDict(
        json_schema_extra={"example": {
            "user_id": "user123",
            "task_title": "Buy groceries"
        }}
    )

    user_id: str = Field(description="The ID of the user")
    task_title: str = Field(description="Title or partial title of the task to delete")


def _delete_task_sync(user_id: str, task_title: str) -> str:
    """Synchronous DB operation to be run in thread pool."""
    from ...database.database import engine
    from sqlmodel import Session

    # Create session with explicit management
    session = None
    try:
        # Validate inputs first (no DB needed)
        if not user_id or not user_id.strip():
            return "Error: user_id is required"

        if not task_title or not task_title.strip():
            return "Error: task_title is required"

        # Create session
        session = Session(engine)

        # Get all user's tasks
        tasks = TaskService.get_user_tasks(session, user_id)

        if not tasks:
            return "You don't have any tasks to delete."

        # Fuzzy match the task
        match_result = fuzzy_match_task(tasks, task_title)

        if match_result is None:
            return f"Task '{task_title}' not found. Please check the task title."

        if isinstance(match_result, list):
            # Multiple matches - ask for clarification
            task_names = [t.title for t in match_result]
            return f"Multiple tasks match '{task_title}'. Please specify which one:\n" + "\n".join(f"- {t}" for t in task_names)

        # Single match - delete it
        task = match_result
        task_id = task.id
        task_title_deleted = task.title

        # Delete the task
        deleted = TaskService.delete_task(session, task_id, user_id)

        if deleted:
            return f"Successfully deleted task '{task_title_deleted}'."
        else:
            return f"Failed to delete task '{task_title_deleted}'. Task may have already been deleted."

    except Exception as e:
        # Rollback on error
        if session:
            try:
                session.rollback()
            except:
                pass
        return f"Error deleting task: {str(e)}"

    finally:
        # Always close session
        if session:
            try:
                session.close()
            except:
                pass


@mcp.tool()
async def delete_task(
    user_id: str,
    task_title: str
) -> str:
    """
    Delete a task by title (fuzzy match).

    Args:
        user_id: The ID of the user (required for ownership validation)
        task_title: Title or partial title of the task to delete

    Returns:
        Human-readable success or error message
    """
    # Run blocking DB operation in thread pool to avoid blocking event loop
    try:
        result = await asyncio.to_thread(_delete_task_sync, user_id, task_title)
        return result
    except asyncio.TimeoutError:
        return "Error: Operation timed out while deleting task"
    except Exception as e:
        return f"Error: Unexpected error in delete_task: {str(e)}"
