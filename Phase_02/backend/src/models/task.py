from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional
from .user import User

class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=1000)
    priority: str = Field(default=None, max_length=50)
    is_completed: bool = Field(default=False)

class Task(TaskBase, table=True):
    """
    Task model representing a personal task owned by a single user.
    """
    id: int = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="user.id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship with User
    user: Optional[User] = Relationship(back_populates="tasks")

class TaskCreate(TaskBase):
    """Schema for creating a new task"""
    pass

class TaskRead(TaskBase):
    """Schema for reading task data"""
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime

class TaskUpdate(SQLModel):
    """Schema for updating task data"""
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    is_completed: Optional[bool] = None

class TaskToggle(SQLModel):
    """Schema for toggling task completion status"""
    is_completed: bool