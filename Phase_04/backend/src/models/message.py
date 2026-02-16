"""
Message SQLModel for AI Chatbot conversation messages.

Messages are the individual chat entries within a conversation,
either from the user or the AI assistant.
"""
from datetime import datetime
from typing import Optional
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship


class MessageRole(str, Enum):
    """Role of the message sender."""
    USER = "user"
    ASSISTANT = "assistant"


class MessageBase(SQLModel):
    """Base fields for Message."""
    role: MessageRole = Field(description="Message sender: user or assistant")
    content: str = Field(description="Message content")


class Message(MessageBase, table=True):
    """
    Message table model.
    Represents a single message within a conversation.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id", index=True)
    role: MessageRole = Field(description="Message sender: user or assistant")
    content: str = Field(description="Message content")
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # Relationship to conversation
    conversation: Optional["Conversation"] = Relationship(back_populates="messages")


class MessageCreate(SQLModel):
    """Schema for creating a new message."""
    role: MessageRole
    content: str


class MessageRead(SQLModel):
    """Schema for reading message data."""
    id: int
    conversation_id: int
    role: MessageRole
    content: str
    created_at: datetime
