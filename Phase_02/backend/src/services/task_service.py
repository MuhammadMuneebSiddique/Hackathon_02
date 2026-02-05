from sqlmodel import Session, select
from typing import List, Optional
from src.models.task import Task, TaskCreate, TaskUpdate, TaskToggle
from src.models.user import User
from fastapi import HTTPException, status

class TaskService:
    """
    Service class for handling task-related business logic.
    """

    @staticmethod
    def get_user_tasks(db: Session, user_id: str) -> List[Task]:
        """
        Get all tasks for a specific user.
        """
        statement = select(Task).where(Task.user_id == user_id)
        return db.exec(statement).all()

    @staticmethod
    def create_task(db: Session, task: TaskCreate, user_id: str) -> Task:
        """
        Create a new task for a user.
        """
        print("=-==================-=-==-=-=--=-=-=-=-==================",task)
        db_task = Task(**task.dict(), user_id=user_id)
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task

    @staticmethod
    def get_task_by_id(db: Session, task_id: int, user_id: str) -> Optional[Task]:
        """
        Get a specific task by ID for a user.
        """
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        return db.exec(statement).first()

    @staticmethod
    def update_task(db: Session, task_id: int, task_update: TaskUpdate, user_id: str) -> Optional[Task]:
        """
        Update a task for a user.
        """
        db_task = TaskService.get_task_by_id(db, task_id, user_id)
        if not db_task:
            return None

        update_data = task_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_task, field, value)

        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task

    @staticmethod
    def delete_task(db: Session, task_id: int, user_id: str) -> bool:
        """
        Delete a task for a user.
        """
        db_task = TaskService.get_task_by_id(db, task_id, user_id)
        if not db_task:
            return False

        db.delete(db_task)
        db.commit()
        return True

    @staticmethod
    def toggle_task_completion(db: Session, task_id: int, task_toggle: TaskToggle, user_id: str) -> Optional[Task]:
        """
        Toggle the completion status of a task for a user.
        """
        db_task = TaskService.get_task_by_id(db, task_id, user_id)
        if not db_task:
            return None

        db_task.is_completed = task_toggle.is_completed

        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task