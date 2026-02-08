"""
MCP Tool: update_task

Updates a task's title or description using fuzzy title matching.
"""
import asyncio
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from ..server import mcp
from ...services.task_service import TaskService
from ...models.task import TaskUpdate
from ...utils.task_matching import fuzzy_match_task


class UpdateTaskInput(BaseModel):
    """Input schema for update_task tool."""
    model_config = ConfigDict(
        json_schema_extra={"example": {
            "user_id": "user123",
            "task_title": "Buy groceries",
            "new_title": "Buy groceries and cook dinner",
            "description": "Need milk, eggs, and bread"
        }}
    )

    user_id: str = Field(description="The ID of the user")
    task_title: str = Field(description="Title or partial title of the task to update")
    new_title: Optional[str] = Field(default=None, description="New title for the task")
    description: Optional[str] = Field(default=None, description="New description for the task")


def _update_task_sync(user_id: str, task_title: str, new_title: Optional[str], description: Optional[str]) -> str:
    """Synchronous DB operation to be run in thread pool."""
    from ...database.database import engine
    from sqlmodel import Session

    with Session(engine) as db:
        try:
            if not user_id or not user_id.strip():
                return "Error: user_id is required"

            if not task_title or not task_title.strip():
                return "Error: task_title is required"

            if not new_title and description is None:
                return "Error: At least one of new_title or description must be provided"

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

            # Single match - update it
            task = match_result

            # Build update data
            update_data = {}
            if new_title:
                if len(new_title) > 100:
                    return "Error: new_title must be 100 characters or less"
                update_data["title"] = new_title.strip()

            if description is not None:
                if description and len(description) > 1000:
                    return "Error: description must be 1000 characters or less"
                update_data["description"] = description.strip() if description else None

            # Perform update
            task_update = TaskUpdate(**update_data)
            TaskService.update_task(db, task.id, task_update, user_id)

            return f"Successfully updated task '{task.title}'."

        except Exception as e:
            return f"Error updating task: {str(e)}"


@mcp.tool()
async def update_task(
    user_id: str,
    task_title: str,
    new_title: Optional[str] = None,
    description: Optional[str] = None
) -> str:
    """
    Update a task's title or description by title (fuzzy match).

    Supports partial updates - only provided fields will be updated.

    Args:
        user_id: The ID of the user (required for ownership validation)
        task_title: Title or partial title of the task to update
        new_title: New title for the task (optional)
        description: New description for the task (optional)

    Returns:
        Human-readable success or error message
    """
    # Run blocking DB operation in thread pool to avoid blocking event loop
    return await asyncio.to_thread(_update_task_sync, user_id, task_title, new_title, description)
