"""
MCP Tool: add_task

Creates a new task for the authenticated user.
"""
import asyncio
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from ..server import mcp
from ...services.task_service import TaskService
from ...models.task import TaskCreate


class AddTaskInput(BaseModel):
    """Input schema for add_task tool."""
    model_config = ConfigDict(
        json_schema_extra={"example": {
            "user_id": "user123",
            "title": "Buy groceries",
            "description": "Get milk and eggs",
            "priority": "medium"
        }}
    )

    user_id: str = Field(description="The ID of the user creating the task")
    title: str = Field(description="Title of the task (1-100 characters)")
    description: Optional[str] = Field(
        default=None,
        description="Optional description of the task (max 1000 characters)"
    )
    priority: Optional[str] = Field(
        default="medium",
        description="Priority of the task (e.g., 'low', 'medium', 'high')"
    )


def _create_task_sync(user_id: str, title: str, description: Optional[str], priority: Optional[str]) -> str:
    """Synchronous DB operation to be run in thread pool."""
    from ...database.database import engine
    from sqlmodel import Session

    with Session(engine) as db:
        try:
            # Validate required fields
            if not user_id.strip():
                return "Error: user_id is required"

            if not title or len(title.strip()) == 0:
                return "Error: title is required"

            # Validate title length
            if len(title) > 100:
                return "Error: title must be 100 characters or less"

            # Validate description length if provided
            if description and len(description) > 1000:
                return "Error: description must be 1000 characters or less"

            # Create task using TaskService
            task_create = TaskCreate(
                title=title.strip(),
                description=description.strip() if description else None,
                priority=priority or "medium",
                is_completed=False
            )

            created_task = TaskService.create_task(db, task_create, user_id)

            # Return success message
            return f"Successfully created task '{created_task.title}' (ID: {created_task.id})"

        except Exception as e:
            return f"Error creating task: {str(e)}"


@mcp.tool()
async def add_task(
    user_id: str,
    title: str,
    description: Optional[str] = None,
    priority: Optional[str] = "medium"
) -> str:
    """
    Create a new task for the user.

    This tool creates a task in the database associated with the specified user.
    All parameters are validated and the user_id is used to ensure data isolation.

    Args:
        user_id: The ID of the user creating the task (required for ownership)
        title: Title of the task (required, 1-100 characters)
        description: Optional description of the task (max 1000 characters)
        priority: Priority level (default: "medium")

    Returns:
        Human-readable success message or error message
    """
    # Run blocking DB operation in thread pool to avoid blocking event loop
    return await asyncio.to_thread(_create_task_sync, user_id, title, description, priority)
