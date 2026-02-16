"""
Conversation SQLModel for AI Chatbot persistence.

Each user has exactly one conversation that persists and grows continuously.
"""
from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class ConversationBase(SQLModel):
    """Base fields for Conversation."""
    pass


class Conversation(ConversationBase, table=True):
    """
    Conversation table model.
    Represents a single continuous chat session between a user and the AI agent.
    Each user has exactly one conversation (enforced by unique constraint on user_id).
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="user.id", unique=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to messages
    messages: List["Message"] = Relationship(back_populates="conversation")


class ConversationCreate(SQLModel):
    """Schema for creating a new conversation."""
    user_id: str


class ConversationRead(SQLModel):
    """Schema for reading conversation data."""
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime
