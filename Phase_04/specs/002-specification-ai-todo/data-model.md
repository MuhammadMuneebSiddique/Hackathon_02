# Data Model: AI Todo Chatbot (Agent + MCP Architecture)

**Feature**: 002-specification-ai-todo
**Date**: 2026-02-08

## Overview

This document defines the data model extensions for the AI Chatbot layer, adding conversation persistence to the existing Todo application.

**Note**: Existing entities (User, Task) remain unchanged. This document only covers new entities.

## Existing Entities (Reference Only)

### User Entity (Managed by Better Auth)

**Description**: Represents an authenticated user of the system

**Fields**:
- `id` (String, Primary Key) - UUID format
- `email` (String) - Unique, required
- `password` (String) - Encrypted, required
- `created_at` (DateTime) - Auto-generated
- `updated_at` (DateTime) - Auto-generated

### Task Entity (Existing - Used by MCP Tools)

**Description**: Represents a personal task owned by a user

**Fields**:
- `id` (Integer, Primary Key) - Auto-increment
- `user_id` (String, Foreign Key) - References users.id
- `title` (String) - Required, max 100 characters
- `description` (Text) - Optional, max 1000 characters
- `priority` (String) - Max 50 characters
- `is_completed` (Boolean) - Default False
- `created_at` (DateTime) - Auto-generated
- `updated_at` (DateTime) - Auto-generated

## New Entities for AI Layer

### Conversation Entity

**Description**: Represents a single continuous chat session between a user and the AI agent. Each user has exactly one conversation.

**Fields**:
- `id` (Integer, Primary Key)
  - Type: Integer (Auto-increment)
  - Constraints: Required, Unique, Auto-generated
  - Description: Unique identifier for the conversation

- `user_id` (String, Foreign Key)
  - Type: String (UUID format)
  - Constraints: Required, Foreign Key to users.id, UNIQUE
  - Description: Reference to the user who owns this conversation. UNIQUE constraint ensures one conversation per user.

- `created_at` (DateTime)
  - Type: DateTime (Timestamp)
  - Constraints: Required, Auto-generated
  - Description: Timestamp of conversation creation (first message)

- `updated_at` (DateTime)
  - Type: DateTime (Timestamp)
  - Constraints: Required, Auto-updated
  - Description: Timestamp of last message in conversation

**Validation Rules**:
- Each user can have only one conversation (enforced by UNIQUE constraint on user_id)
- Conversation created automatically when user sends first message
- updated_at updates automatically when new message added

### Message Entity

**Description**: Represents a single message within a conversation, either from the user or the AI agent.

**Fields**:
- `id` (Integer, Primary Key)
  - Type: Integer (Auto-increment)
  - Constraints: Required, Unique, Auto-generated
  - Description: Unique identifier for the message

- `conversation_id` (Integer, Foreign Key)
  - Type: Integer
  - Constraints: Required, Foreign Key to conversations.id
  - Description: Reference to the conversation this message belongs to

- `role` (String)
  - Type: String (Enum)
  - Constraints: Required, Must be "user" or "assistant"
  - Description: Indicates whether message is from user or AI agent

- `content` (Text)
  - Type: Text
  - Constraints: Required
  - Description: The actual message content

- `created_at` (DateTime)
  - Type: DateTime (Timestamp)
  - Constraints: Required, Auto-generated
  - Description: Timestamp of when message was created

**Validation Rules**:
- role must be exactly "user" or "assistant"
- content cannot be empty
- conversation_id must reference existing conversation
- Messages are ordered by created_at within a conversation

## Relationships

### User to Conversation (One-to-One)

- One User has exactly One Conversation
- Foreign key: conversations.user_id references users.id
- UNIQUE constraint on user_id enforces one-to-one
- Cascade delete: When user is deleted, their conversation is also deleted

**Rationale**: Single conversation per user simplifies UX and matches personal assistant mental model.

### Conversation to Messages (One-to-Many)

- One Conversation can have Many Messages
- Foreign key: messages.conversation_id references conversations.id
- Cascade delete: When conversation is deleted, all messages are also deleted
- Ordered by: created_at ascending (chronological order)

**Rationale**: Messages belong to a conversation; deleting conversation should clean up all messages.

## Database Schema

```sql
-- Conversations table (one per user)
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table (many per conversation)
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

## Constraints & Indexes

### Constraints

- `conversations.user_id`: UNIQUE constraint ensures one conversation per user
- `conversations.user_id`: FOREIGN KEY to users with CASCADE DELETE
- `messages.conversation_id`: FOREIGN KEY to conversations with CASCADE DELETE
- `messages.role`: CHECK constraint ensures valid role values
- `messages.content`: NOT NULL ensures no empty messages

### Indexes

- `idx_conversations_user_id`: Fast lookup of conversation by user
- `idx_messages_conversation_id`: Fast retrieval of all messages in a conversation
- `idx_messages_created_at`: Efficient ordering and sliding window queries

## SQLModel Definitions

```python
from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from enum import Enum

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"

class Conversation(SQLModel, table=True):
    """Single continuous conversation between user and AI agent."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", unique=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    messages: List["Message"] = Relationship(back_populates="conversation", cascade_delete=True)

class Message(SQLModel, table=True):
    """Single message in a conversation."""
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    role: MessageRole = Field(description="Message sender: user or assistant")
    content: str = Field(description="Message content")
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # Relationship
    conversation: Optional[Conversation] = Relationship(back_populates="messages")

# Schemas for API

class MessageCreate(SQLModel):
    """Schema for creating a new message."""
    content: str

class MessageRead(SQLModel):
    """Schema for reading a message."""
    id: int
    role: MessageRole
    content: str
    created_at: datetime

class ConversationRead(SQLModel):
    """Schema for reading conversation with messages."""
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageRead] = []
```

## Security Considerations

### Data Isolation

- All conversation queries MUST filter by user_id from authenticated JWT
- MCP tools receive user_id from authenticated context only
- Users cannot access other users' conversations or messages
- Foreign key constraints prevent orphaned data

### Access Control

- Chat endpoint requires valid JWT authentication
- Conversation creation tied to authenticated user
- Message access scoped to user's own conversation

## Performance Considerations

### Query Optimization

- Index on `messages(conversation_id, created_at)` for efficient history loading
- Sliding window limits messages loaded into context
- Consider pagination for UI display of long conversations

### Token Estimation

```python
def estimate_tokens(text: str) -> int:
    """Estimate token count for text (rough approximation)."""
    # Rough estimate: 1 token ≈ 4 characters
    return len(text) // 4

def get_context_messages(conversation_id: int, max_tokens: int = 4000) -> List[Message]:
    """Get recent messages within token budget."""
    messages = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(50)  # Hard limit as safety
    ).all()

    total_tokens = 0
    context = []

    for msg in reversed(messages):  # Process oldest to newest
        msg_tokens = estimate_tokens(msg.content)
        if total_tokens + msg_tokens > max_tokens:
            break
        context.append(msg)
        total_tokens += msg_tokens

    return context
```

## Migration Strategy

1. Create new tables (conversations, messages) without breaking existing tables
2. Add indexes for performance
3. No data migration needed (new feature, no existing data)
4. Existing users get conversation created on first chat message

## Data Retention

- Conversations and messages persist indefinitely
- Cascade delete removes all messages when user is deleted
- No automatic archival (can be added later if needed)
