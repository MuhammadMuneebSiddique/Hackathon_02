from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session
from typing import List
from src.database.database import get_session
from src.models.task import Task, TaskCreate, TaskRead, TaskUpdate, TaskToggle
from src.models.user import User
from src.services.task_service import TaskService
from src.utils.better_auth import get_current_user_from_better_auth
from src.utils.jwt_auth import validate_user_id_in_url_matches_token

router = APIRouter()

@router.get("/{user_id}/tasks", response_model=List[TaskRead])
async def get_tasks(
    user_id: str,
    request: Request,
    current_user: User = Depends(validate_user_id_in_url_matches_token),
    db: Session = Depends(get_session)
):
    """
    Retrieve all tasks for the authenticated user.
    """
    # The validation is already done by the dependency
    tasks = TaskService.get_user_tasks(db, current_user.id)
    return tasks

@router.post("/{user_id}/tasks", response_model=TaskRead)
async def create_task(
    user_id: str,
    task: TaskCreate,
    request: Request,
    current_user: User = Depends(validate_user_id_in_url_matches_token),
    db: Session = Depends(get_session)
):
    """
    Create a new task for the authenticated user.
    """
    # The validation is already done by the dependency
    db_task = TaskService.create_task(db, task, current_user.id)
    return db_task

@router.get("/{user_id}/tasks/{task_id}", response_model=TaskRead)
async def get_task(
    user_id: str,
    task_id: int,
    request: Request,
    current_user: User = Depends(validate_user_id_in_url_matches_token),
    db: Session = Depends(get_session)
):
    """
    Retrieve a specific task if it belongs to the authenticated user.
    """
    # The validation is already done by the dependency
    task = TaskService.get_task_by_id(db, task_id, current_user.id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or you don't have permission to access it"
        )

    return task

@router.put("/{user_id}/tasks/{task_id}", response_model=TaskRead)
async def update_task(
    user_id: str,
    task_id: int,
    task_update: TaskUpdate,
    request: Request,
    current_user: User = Depends(validate_user_id_in_url_matches_token),
    db: Session = Depends(get_session)
):
    """
    Update task content for the authenticated user.
    """
    # The validation is already done by the dependency
    updated_task = TaskService.update_task(db, task_id, task_update, current_user.id)

    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or you don't have permission to update it"
        )

    return updated_task

@router.delete("/{user_id}/tasks/{task_id}")
async def delete_task(
    user_id: str,
    task_id: int,
    request: Request,
    current_user: User = Depends(validate_user_id_in_url_matches_token),
    db: Session = Depends(get_session)
):
    """
    Delete a task for the authenticated user.
    """
    # The validation is already done by the dependency
    success = TaskService.delete_task(db, task_id, current_user.id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or you don't have permission to delete it"
        )

    return {"message": "Task deleted successfully"}

@router.patch("/{user_id}/tasks/{task_id}/toggle", response_model=TaskRead)
async def toggle_task_completion(
    user_id: str,
    task_id: int,
    task_toggle: TaskToggle,
    request: Request,
    current_user: User = Depends(validate_user_id_in_url_matches_token),
    db: Session = Depends(get_session)
):
    """
    Toggle the completion status of a task for the authenticated user.
    """
    # The validation is already done by the dependency
    updated_task = TaskService.toggle_task_completion(db, task_id, task_toggle, current_user.id)

    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or you don't have permission to update it"
        )

    return updated_task