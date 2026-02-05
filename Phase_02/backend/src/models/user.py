from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import List, Optional
import uuid


class UserBase(SQLModel):
    email: str = Field(unique=True, nullable=False)

class User(UserBase, table=True):
    """
    User model representing an authenticated user of the system.
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    # Relationship with Tasks - using string reference to avoid circular import
    tasks: List["Task"] = Relationship(back_populates="user")

class UserCreate(UserBase):
    """Schema for creating a new user"""
    email: Optional[str] = None
    password: Optional[str] = None

class UserRead(UserBase):
    """Schema for reading user data (without password)"""
    id: str
    createdAt: datetime
    updatedAt: datetime

class UserUpdate(SQLModel):
    """Schema for updating user data"""
    email: Optional[str] = None
    password: Optional[str] = None