"""
MCP Tool: list_tasks

Retrieves tasks for the authenticated user with optional filtering.
"""
import asyncio
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from ..server import mcp
from ...services.task_service import TaskService


class ListTasksInput(BaseModel):
    """Input schema for list_tasks tool."""
    model_config = ConfigDict(
        json_schema_extra={"example": {
            "user_id": "user123",
            "include_completed": True
        }}
    )

    user_id: str = Field(description="The ID of the user")
    include_completed: Optional[bool] = Field(
        default=True,
        description="Whether to include completed tasks"
    )


def _list_tasks_sync(user_id: str, include_completed: bool) -> str:
    """Synchronous DB operation to be run in thread pool."""
    from ...database.database import engine
    from sqlmodel import Session

    with Session(engine) as db:
        try:
            if not user_id or not user_id.strip():
                return "Error: user_id is required"

            tasks = TaskService.get_user_tasks(db, user_id)

            # Filter by completion status
            if not include_completed:
                tasks = [t for t in tasks if not t.is_completed]

            if not tasks:
                return "You don't have any tasks yet."

            # Format tasks as readable list
            task_lines = []
            for task in tasks:
                status = "completed" if task.is_completed else "pending"
                priority_str = f" [Priority: {task.priority}]" if task.priority else ""
                desc_str = f"\n  Description: {task.description}" if task.description else ""
                task_lines.append(f"- {task.title} ({status}){priority_str}{desc_str}")

            return "Here are your tasks:\n" + "\n".join(task_lines)

        except Exception as e:
            return f"Error listing tasks: {str(e)}"


@mcp.tool()
async def list_tasks(
    user_id: str,
    include_completed: bool = True
) -> str:
    """
    List all tasks for the user.

    Args:
        user_id: The ID of the user (required for data isolation)
        include_completed: Whether to include completed tasks (default: True)

    Returns:
        Formatted task list as a human-readable string
    """
    # Run blocking DB operation in thread pool to avoid blocking event loop
    return await asyncio.to_thread(_list_tasks_sync, user_id, include_completed)
