# Implementation Plan: AI Todo Chatbot (Agent + MCP Architecture)

**Feature Branch**: `002-specification-ai-todo`
**Created**: 2026-02-08
**Status**: Draft
**Input**: User description: "Phase III - Add AI chatbot layer to existing Todo app using OpenAI Agents SDK and MCP server for task management. Agent must use MCP tools for all task operations, conversations must persist across sessions, and the system must remain stateless."

**Prerequisites**: Existing Todo app (specs/001-todo-app-auth) with Better Auth, Task CRUD APIs, and database models are fully functional.

## Technical Context

The AI Chatbot layer extends the existing full-stack Todo application:

- **Frontend**: Next.js 16+ (App Router), TypeScript, Tailwind CSS (existing)
- **Backend**: FastAPI (Python), SQLModel (ORM), Pydantic v2 (existing)
- **Database**: Neon Serverless PostgreSQL (existing)
- **Authentication**: Better Auth with JWT verification (existing)
- **AI Agent**: OpenAI Agents SDK with OpenRouter integration (NEW)
- **MCP Server**: Official MCP SDK (Python FastMCP) (NEW)
- **API Style**: RESTful for CRUD, new chat endpoint for AI interactions

**Existing System Integration Points**:
- Task Model: `backend/src/models/task.py` - SQLModel with id, user_id, title, description, priority, is_completed
- Task Service: `backend/src/services/task_service.py` - Business logic for CRUD operations
- Auth Utils: `backend/src/utils/jwt_auth.py` - JWT validation via Better Auth JWKS
- Routes: `backend/src/routes/tasks.py` - Existing task CRUD endpoints
- Main App: `backend/main.py` - FastAPI entry point (port 8001)

**Key Technical Decisions**:
- Agent-Tool Separation: Agent uses MCP tools exclusively, never accesses DB directly
- Stateless Architecture: Each request loads/saves conversation from DB, no server memory
- Conversation Model: Single conversation per user that persists and grows continuously
- Context Management: Sliding window with token budget (4000 tokens) for long conversations
- Task Matching: Fuzzy title matching with clarification for ambiguous references

## Constitution Check

This plan adheres to all principles in the Phase III Todo AI Chatbot Constitution:

✅ **Project Understanding Comes First**: Read existing spec at `specs/001-todo-app-auth`, explored backend structure, understood Task model and auth flow
✅ **Mandatory Skill Usage Rules**: Will use `openai-agents-sdk` and `mcp-builder` skills for implementation
✅ **Respect Existing Application Architecture**: No rebuilding of CRUD APIs, auth, or Task models - extending only
✅ **AI Agent Role Definition**: Agent is task management assistant, uses MCP tools for ALL operations
✅ **MCP Server Responsibility**: Tools will be stateless, validate user_id, return structured responses
✅ **Conversation Persistence**: Single conversation per user, persisted in database
✅ **Frontend Integration**: No ChatKit - integrates with existing custom UI
✅ **Development Methodology**: Following Spec → Plan → Task → Implement cycle
✅ **Prohibited Actions**: No rebuilding, no ChatKit, no server-side memory, no direct DB access from agent

**Gates**:
- [x] Existing system understood and documented
- [x] Integration points identified
- [x] Skills referenced for implementation patterns
- [x] Statelessness requirement designed into architecture
- [x] Data isolation (user_id validation) enforced in MCP tools

## Phase 0: Research & Unknown Resolution

### Research Summary

#### Technology Choices Resolved

**Decision**: Use OpenRouter for LLM integration with model name from environment variable
**Rationale**: User specified OpenRouter per openai-agents-sdk skill patterns. Allows flexibility in model selection without code changes.
**Alternatives considered**: Direct Gemini API, OpenAI API - rejected per user requirement

**Decision**: Use Official MCP SDK (Python FastMCP) for MCP server
**Rationale**: Aligns with mcp-builder skill recommendations for Python backends. Streamable HTTP transport for production.
**Alternatives considered**: TypeScript MCP SDK - rejected to maintain single-language backend

**Decision**: Implement single conversation per user with continuous growth
**Rationale**: Clarification session determined single conversation provides simpler UX and mental model for personal assistant
**Alternatives considered**: Multiple named conversations - rejected per clarification

**Decision**: Use sliding window (4000 tokens) for context management
**Rationale**: Prevents context overflow while maintaining recent conversation relevance. Task management doesn't require very old context.
**Alternatives considered**: Summarization, no limit - rejected due to complexity/token limits

**Decision**: Fuzzy title matching for task identification
**Rationale**: Most natural for conversational interfaces. Users won't remember task IDs.
**Alternatives considered**: Exact match, ID-based - rejected as poor UX for chat

**Decision**: Friendly error messages for AI service unavailability
**Rationale**: Practical for MVP. Queueing adds complexity without clear benefit for task management use case.
**Alternatives considered**: Message queueing, cached responses - rejected due to complexity

## Phase 1: Design & Contracts

### Data Model Design

#### Existing Entities (No Changes)

**User Entity** (managed by Better Auth):
- `id`: String (Primary Key, Unique)
- `email`: String (Unique, Required)
- `password`: String (Encrypted, Required)
- `created_at`: DateTime
- `updated_at`: DateTime

**Task Entity** (existing, used by MCP tools):
- `id`: Integer (Primary Key, Auto-increment)
- `user_id`: String (Foreign Key to users.id)
- `title`: String (Required, Max 100 characters)
- `description`: Text (Optional, Max 1000 characters)
- `priority`: String (Max 50 characters)
- `is_completed`: Boolean (Default: False)
- `created_at`: DateTime
- `updated_at`: DateTime

#### New Entities for AI Layer

**Conversation Entity**:
- `id`: Integer (Primary Key, Auto-increment)
- `user_id`: String (Foreign Key to users.id, Unique - one conversation per user)
- `created_at`: DateTime (Auto-generated)
- `updated_at`: DateTime (Auto-updated on new messages)

**Message Entity**:
- `id`: Integer (Primary Key, Auto-increment)
- `conversation_id`: Integer (Foreign Key to conversations.id)
- `role`: String (Enum: "user" or "assistant")
- `content`: Text (Message content)
- `created_at`: DateTime (Auto-generated)

#### Relationships
- One User to One Conversation (One-to-One, enforced by unique constraint)
- One Conversation to Many Messages (One-to-Many)
- Foreign key constraints ensure referential integrity
- Cascade delete: Deleting user deletes conversation and messages

### API Contract Design

#### Existing API Endpoints (No Changes)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/{user_id}/tasks` | Get all tasks for user |
| POST | `/api/{user_id}/tasks` | Create task |
| GET | `/api/{user_id}/tasks/{task_id}` | Get single task |
| PUT | `/api/{user_id}/tasks/{task_id}` | Update task |
| DELETE | `/api/{user_id}/tasks/{task_id}` | Delete task |
| PATCH | `/api/{user_id}/tasks/{task_id}/toggle` | Toggle completion |

#### New Chat API Endpoint

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/chat` | Send message to AI agent, get response | Yes (JWT) |
| GET | `/api/chat/history` | Get conversation history | Yes (JWT) |

#### Chat API Request/Response

**POST /api/chat Request**:
```json
{
  "message": "Add a task to buy groceries tomorrow"
}
```

**POST /api/chat Response** (200 OK):
```json
{
  "response": "I've created a new task 'Buy groceries tomorrow' for you. Is there anything else you'd like to add?",
  "conversation_id": 1,
  "message_id": 42
}
```

**GET /api/chat/history Response** (200 OK):
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

#### MCP Server Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mcp` | MCP protocol endpoint for agent communication |

### Stateless Request Cycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Chat Request Flow                               │
└─────────────────────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────┐
│ 1. Auth Check    │ ◄── Validate JWT via Better Auth JWKS
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 2. Get/Create    │ ◄── Load or create single conversation for user
│    Conversation  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 3. Store User    │ ◄── Save user message to messages table
│    Message       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 4. Load History  │ ◄── Fetch recent messages (sliding window ~4000 tokens)
│    + Context     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 5. Run Agent     │ ◄── Agent with MCP tools (add_task, list_tasks, etc.)
│    with Context  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 6. Store Agent   │ ◄── Save assistant response to messages table
│    Response      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 7. Return        │ ◄── Return response to user, clear runtime state
│    Response      │
└──────────────────┘
```

### MCP Tools Specification

All tools validate `user_id` ownership before operations.

| Tool | Description | Parameters | Returns |
|------|-------------|------------|---------|
| `add_task` | Create new task | title, description?, priority? | task object |
| `list_tasks` | Get user's tasks | include_completed? | task list |
| `complete_task` | Mark task complete | task_title (fuzzy match) | updated task |
| `delete_task` | Remove task | task_title (fuzzy match) | success message |
| `update_task` | Modify task details | task_title, new_title?, description? | updated task |

### Agent Instructions

```python
agent_instructions = """
You are a helpful task management assistant for a Todo application.

Your role is to help users manage their tasks through natural conversation.

CAPABILITIES:
- Create new tasks with titles and optional descriptions
- List all tasks or filter by completion status
- Mark tasks as complete
- Delete tasks
- Update task details

BEHAVIOR GUIDELINES:
1. Always use the available MCP tools to perform task operations
2. When users reference tasks by name, use fuzzy matching to find them
3. If multiple tasks match a name, ask for clarification
4. Confirm actions clearly after completing them
5. Handle errors gracefully with user-friendly messages
6. Keep responses concise and helpful

TASK MATCHING:
- Users may reference tasks by partial names or descriptions
- Match the closest task title when possible
- If ambiguous (e.g., "meeting" matches multiple tasks), list options and ask user to clarify

ERROR HANDLING:
- If a task isn't found, explain this clearly
- If the AI service has issues, apologize and suggest retrying
- For invalid requests, guide users on proper usage
"""
```

### Database Schema Extensions

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

## Phase 2: Implementation Strategy

### Implementation Order

1. **Database Extension**:
   - Add Conversation and Message SQLModel models
   - Create migration for new tables
   - Add database indexes for performance

2. **MCP Server Layer**:
   - Create MCP server using FastMCP
   - Implement 5 task management tools
   - Integrate with existing TaskService for database operations
   - Add user_id validation to all tools

3. **AI Agent Setup**:
   - Configure OpenRouter client with AsyncOpenAI
   - Create agent with task management instructions
   - Register MCP tools with agent
   - Implement sliding window for context management

4. **Chat API Endpoint**:
   - Create `/api/chat` POST endpoint
   - Implement stateless request cycle
   - Add conversation persistence
   - Handle authentication via existing JWT validation

5. **Frontend Integration**:
   - Create chat UI component (no ChatKit)
   - Connect to `/api/chat` endpoint
   - Display conversation history
   - Handle loading and error states

6. **Error Handling & Testing**:
   - Add graceful error handling for AI service issues
   - Test all natural language commands
   - Verify user isolation
   - Performance testing with long conversations

### Security Measures

- **User Isolation**: Every MCP tool validates user_id before operations
- **Authentication**: Chat endpoint requires valid JWT from Better Auth
- **Input Validation**: All inputs validated with Pydantic schemas
- **Error Messages**: User-friendly without exposing internal details
- **Rate Limiting**: Consider rate limiting on chat endpoint

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Frontend (Next.js)                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Chat UI Component  │  Task List  │  Existing Components         │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP/JWT
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Backend (FastAPI)                             │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐    │
│  │  /api/chat     │  │  /api/mcp      │  │  /api/{user_id}/tasks  │    │
│  │  (NEW)         │  │  (NEW)         │  │  (EXISTING)            │    │
│  └───────┬────────┘  └───────┬────────┘  └────────────────────────┘    │
│          │                   │                                           │
│          ▼                   ▼                                           │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │              AI Agent (OpenAI Agents SDK)                       │     │
│  │  • OpenRouter client (AsyncOpenAI)                             │     │
│  │  • Task management instructions                                 │     │
│  │  • MCP server connection                                        │     │
│  └─────────────────────────┬──────────────────────────────────────┘     │
│                            │ MCP Protocol                               │
│                            ▼                                            │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │              MCP Server (FastMCP)                               │     │
│  │  • add_task    • list_tasks    • complete_task                 │     │
│  │  • delete_task • update_task                                    │     │
│  │  • All tools validate user_id                                   │     │
│  └─────────────────────────┬──────────────────────────────────────┘     │
│                            │                                            │
│                            ▼                                            │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │              TaskService (EXISTING)                             │     │
│  │  • CRUD operations with user isolation                          │     │
│  └─────────────────────────┬──────────────────────────────────────┘     │
└────────────────────────────┼────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Database (Neon PostgreSQL)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │  users       │  │  tasks       │  │  conversations│ (NEW)            │
│  │  (EXISTING)  │  │  (EXISTING)  │  │  messages    │ (NEW)            │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Quickstart Guide

1. **Environment Setup**:
   ```bash
   # Backend .env
   DATABASE_URL=your-neon-postgres-url
   BETTER_AUTH_SECRET=your-shared-secret
   OPENROUTER_API_KEY=your-openrouter-key
   OPENROUTER_MODEL=your-model-name  # e.g., openai/gpt-oss-20b:free
   ```

2. **Install Dependencies**:
   ```bash
   cd backend
   pip install openai-agents mcp  # or: uv add openai-agents mcp
   ```

3. **Run Database Migration**:
   ```bash
   # Migration script will create conversations and messages tables
   alembic upgrade head
   ```

4. **Start Services**:
   ```bash
   # Backend
   cd backend && uvicorn main:app --reload --port 8001

   # Frontend
   cd frontend && npm run dev
   ```

5. **Access Chat**:
   - Navigate to chat interface in the app
   - Start conversing with the AI task assistant

## Phase 3: Risk Assessment

### High-Risk Areas

1. **Token Budget Management**: Sliding window must accurately estimate tokens
2. **Fuzzy Task Matching**: May incorrectly match tasks, causing confusion
3. **AI Service Reliability**: OpenRouter availability affects core functionality
4. **Context Loss**: Long conversations may lose important early context

### Mitigation Strategies

1. **Conservative Token Estimation**: Use character-based estimation with buffer
2. **Match Confidence Threshold**: Require high confidence or ask for clarification
3. **Graceful Degradation**: Clear error messages when AI service unavailable
4. **User Feedback**: Allow users to reference tasks by ID if matching fails

## Next Steps

1. Generate detailed tasks using `/sp.tasks`
2. Begin with database extension (Conversation, Message models)
3. Implement MCP server with all 5 task tools
4. Create AI agent with OpenRouter integration
5. Build stateless chat API endpoint
6. Integrate with frontend chat UI
