"""
MCP Tool: complete_task

Marks a task as completed using fuzzy title matching.
"""
import asyncio
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from ..server import mcp
from ...services.task_service import TaskService
from ...utils.task_matching import fuzzy_match_task


class CompleteTaskInput(BaseModel):
    """Input schema for complete_task tool."""
    model_config = ConfigDict(
        json_schema_extra={"example": {
            "user_id": "user123",
            "task_title": "Buy groceries"
        }}
    )

    user_id: str = Field(description="The ID of the user")
    task_title: str = Field(description="Title or partial title of the task to complete")


def _complete_task_sync(user_id: str, task_title: str) -> str:
    """Synchronous DB operation to be run in thread pool."""
    from ...database.database import engine
    from sqlmodel import Session

    with Session(engine) as db:
        try:
            if not user_id or not user_id.strip():
                return "Error: user_id is required"

            if not task_title or not task_title.strip():
                return "Error: task_title is required"

            # Get all user's tasks
            tasks = TaskService.get_user_tasks(db, user_id)

            # Fuzzy match the task
            match_result = fuzzy_match_task(tasks, task_title)

            if match_result is None:
                return f"Task '{task_title}' not found. Please check the task title."

            if isinstance(match_result, list):
                # Multiple matches - ask for clarification
                task_names = [t.title for t in match_result]
                return f"Multiple tasks match '{task_title}'. Please specify which one:\n" + "\n".join(f"- {t}" for t in task_names)

            # Single match - complete it
            task = match_result

            if task.is_completed:
                return f"Task '{task.title}' is already completed."

            # Toggle completion
            TaskService.toggle_task_completion(
                db, task.id, {"is_completed": True}, user_id
            )

            return f"Successfully marked '{task.title}' as completed."

        except Exception as e:
            return f"Error completing task: {str(e)}"


@mcp.tool()
async def complete_task(
    user_id: str,
    task_title: str
) -> str:
    """
    Mark a task as completed by title (fuzzy match).

    Args:
        user_id: The ID of the user (required for ownership validation)
        task_title: Title or partial title of the task to complete

    Returns:
        Human-readable success or error message
    """
    # Run blocking DB operation in thread pool to avoid blocking event loop
    return await asyncio.to_thread(_complete_task_sync, user_id, task_title)
