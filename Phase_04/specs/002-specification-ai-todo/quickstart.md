# Quickstart: AI Todo Chatbot (Agent + MCP Architecture)

**Feature**: 002-specification-ai-todo
**Date**: 2026-02-08

## Overview

This guide provides step-by-step instructions to set up and run the AI Todo Chatbot feature, which adds natural language task management to the existing Todo application.

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL database (Neon Serverless recommended)
- OpenRouter API key

## Environment Setup

### Backend Environment Variables

Create/update `backend/.env`:

```env
# Existing (required)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
BETTER_AUTH_SECRET=your-shared-secret-here
ALGORITHM=EdDSA

# NEW for AI Chatbot
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key
OPENROUTER_MODEL=openai/gpt-oss-20b:free
# Alternative models:
# OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free
# OPENROUTER_MODEL=anthropic/claude-3-haiku
```

### Frontend Environment Variables

Create/update `frontend/.env.local`:

```env
# Existing (required)
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-frontend-url.vercel.app
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# No new variables needed for AI chatbot
```

## Installation

### Backend Dependencies

```bash
cd backend

# Using pip
pip install openai-agents mcp

# Or using uv
uv add openai-agents mcp
```

### Frontend Dependencies

No new frontend dependencies required. The chat UI uses existing React/Next.js components.

## Database Migration

### Create Migration

```bash
cd backend

# Create migration for new tables
alembic revision --autogenerate -m "Add conversations and messages tables"

# Apply migration
alembic upgrade head
```

### Verify Tables Created

```sql
-- Check conversations table exists
SELECT * FROM conversations LIMIT 1;

-- Check messages table exists
SELECT * FROM messages LIMIT 1;

-- Verify indexes
\di conversations*
\di messages*
```

## Running the Application

### Start Backend

```bash
cd backend

# Development mode with auto-reload
uvicorn main:app --reload --port 8001

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8001
```

### Start Frontend

```bash
cd frontend

# Development mode
npm run dev

# Production build
npm run build
npm start
```

### Verify Services

- Backend API: http://localhost:8001/docs
- Frontend App: http://localhost:3000

## Using the AI Chatbot

### 1. Register/Login

1. Navigate to the app
2. Register a new account or login with existing credentials
3. Ensure you're authenticated (see dashboard)

### 2. Access Chat Interface

1. Navigate to the chat section in the app
2. You'll see your conversation history (if any)

### 3. Chat with the Assistant

Try these natural language commands:

#### Create Tasks
```
"Add a task to buy groceries tomorrow"
"Create a task: Review PR by Friday"
"I need to call mom later"
```

#### List Tasks
```
"Show my tasks"
"What tasks do I have?"
"List all my pending tasks"
"Show completed tasks"
```

#### Complete Tasks
```
"Mark 'Buy groceries' as done"
"Complete the call mom task"
"Finish the PR review task"
```

#### Delete Tasks
```
"Delete the groceries task"
"Remove 'Call mom' from my list"
```

#### Update Tasks
```
"Change 'Buy groceries' to 'Buy groceries and cook dinner'"
"Update the PR review task description"
```

### 4. Conversation Persistence

- Your conversation is automatically saved
- Close and reopen the app - your chat history persists
- Each user has their own private conversation

## API Endpoints

### Chat Endpoint

**POST** `/api/chat`

Send a message to the AI assistant.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "Add a task to buy groceries"
}
```

**Response:**
```json
{
  "response": "I've created a new task 'Buy groceries' for you.",
  "conversation_id": 1,
  "message_id": 42
}
```

### History Endpoint

**GET** `/api/chat/history`

Get conversation history.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "conversation_id": 1,
  "messages": [
    {
      "id": 1,
      "role": "user",
      "content": "Add a task to call mom",
      "created_at": "2026-02-08T10:00:00Z"
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "I've created the task 'Call mom' for you.",
      "created_at": "2026-02-08T10:00:02Z"
    }
  ]
}
```

## Troubleshooting

### "OpenRouter API key not found"

**Solution**: Ensure `OPENROUTER_API_KEY` is set in `backend/.env`

### "Conversation not found"

**Solution**: This is normal for first-time users. Send your first message to create a conversation.

### "Task not found"

**Solution**: The agent couldn't match your task reference. Try:
- Using the exact task title
- Being more specific
- Listing tasks first with "Show my tasks"

### "AI service temporarily unavailable"

**Solution**: OpenRouter may be experiencing issues. Wait a moment and try again.

### "Authentication failed"

**Solution**: Your JWT token may have expired. Log out and log back in.

### Long response times

**Solution**: First requests may be slower due to model loading. Subsequent requests should be faster.

## Testing the Integration

### Test Chat Flow

```bash
# 1. Get auth token (after login)
TOKEN="your-jwt-token"

# 2. Send chat message
curl -X POST http://localhost:8001/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a test task"}'

# 3. Get history
curl -X GET http://localhost:8001/api/chat/history \
  -H "Authorization: Bearer $TOKEN"
```

### Verify Task Creation

1. Send "Add a test task" via chat
2. Navigate to tasks page
3. Verify task appears in list
4. Verify task belongs to correct user

### Test User Isolation

1. Login as User A
2. Send "Add task: User A's task"
3. Login as User B
4. Send "Show my tasks"
5. Verify User B doesn't see User A's task

## Development Tips

### Viewing Logs

```bash
# Backend logs
cd backend
uvicorn main:app --reload --port 8001 --log-level debug

# Check conversation messages in database
SELECT * FROM messages ORDER BY created_at DESC LIMIT 10;
```

### Testing MCP Tools

The MCP tools can be tested independently via the MCP endpoint:

```bash
# MCP tools are at /api/mcp
# Use MCP Inspector for testing
npx @modelcontextprotocol/inspector http://localhost:8001/api/mcp
```

### Adjusting Context Window

Edit `backend/src/services/chat_service.py`:

```python
# Adjust token budget
MAX_CONTEXT_TOKENS = 4000  # Increase for longer context

# Adjust message limit
MAX_MESSAGES_LOADED = 50  # Safety limit
```

### Changing AI Model

Edit `backend/.env`:

```env
# Free tier models
OPENROUTER_MODEL=openai/gpt-oss-20b:free
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free

# Paid models (better performance)
OPENROUTER_MODEL=anthropic/claude-3-haiku
OPENROUTER_MODEL=openai/gpt-4o-mini
```

## Architecture Overview

```
User Request → Chat API → Load Conversation → Store Message
                                    ↓
                            Load Context (Sliding Window)
                                    ↓
                            Run Agent with MCP Tools
                                    ↓
                            Store Response → Return to User
```

## Support

For issues or questions:
1. Check this quickstart guide
2. Review the plan.md for architecture details
3. Check data-model.md for database schema
4. Review research.md for design decisions
