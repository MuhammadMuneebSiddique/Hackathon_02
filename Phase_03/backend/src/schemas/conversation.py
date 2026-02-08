"""
Conversation schemas for AI Chatbot API requests and responses.
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from enum import Enum


class MessageRole(str, Enum):
    """Role of the message sender."""
    USER = "user"
    ASSISTANT = "assistant"


class ChatRequest(BaseModel):
    """Request schema for sending a chat message."""
    message: str


class ChatResponse(BaseModel):
    """Response schema for chat endpoint."""
    response: str
    conversation_id: int
    message_id: int


class MessageResponse(BaseModel):
    """Schema for a single message in history."""
    id: int
    role: MessageRole
    content: str
    created_at: datetime


class ChatHistoryResponse(BaseModel):
    """Response schema for chat history endpoint."""
    conversation_id: int
    messages: List[MessageResponse]


class ConversationCreate(BaseModel):
    """Schema for creating a new conversation."""
    user_id: str


class ConversationRead(BaseModel):
    """Schema for reading conversation data."""
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime


class MessageCreate(BaseModel):
    """Schema for creating a new message."""
    role: MessageRole
    content: str


class MessageRead(BaseModel):
    """Schema for reading message data."""
    id: int
    conversation_id: int
    role: MessageRole
    content: str
    created_at: datetime
