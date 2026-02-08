# Feature Specification: AI Todo Chatbot (Agent + MCP Architecture)

**Feature Branch**: `002-ai-todo-chatbot`
**Created**: 2026-02-08
**Status**: Draft
**Input**: User description: "Phase III - Add AI chatbot layer to existing Todo app using OpenAI Agents SDK and MCP server for task management. Agent must use MCP tools for all task operations, conversations must persist across sessions, and the system must remain stateless."

**Prerequisites**: Existing Todo app (specs/001-todo-app-auth) with Better Auth, Task CRUD APIs, and database models are fully functional.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Natural Language Task Creation (Priority: P1)

An authenticated user opens the chat interface and creates a task using natural language. The AI agent understands the request, uses MCP tools to create the task in the database, and confirms successful creation with the user. The task appears in the user's task list immediately.

**Why this priority**: This is the core MVP functionality - demonstrating that the AI agent can successfully interact with tasks via natural language and MCP tools.

**Independent Test**: A logged-in user sends a chat message "Add a task to buy groceries tomorrow" and receives confirmation that the task was created. The task appears in their task list with the correct title.

**Acceptance Scenarios**:

1. **Given** user is logged in and chat interface is open, **When** user types "Create a task to call mom", **Then** agent creates task via MCP tool and responds with confirmation including task title
2. **Given** user sends message "Add task: Review PR by Friday", **When** agent processes request, **Then** MCP tool creates task with title "Review PR by Friday" for the current user only
3. **Given** user asks to add task without specifying title, **When** agent processes request, **Then** agent prompts for clarification without creating incomplete task

---

### User Story 2 - View and List Tasks via Chat (Priority: P1)

An authenticated user asks the AI agent to show their tasks. The agent uses MCP tools to retrieve the user's tasks and presents them in a readable format in the chat. Only the current user's tasks are shown.

**Why this priority**: Essential for users to verify their task management actions and see their current workload through natural conversation.

**Independent Test**: A user with existing tasks sends "Show my tasks" and receives a formatted list of only their own tasks with completion status.

**Acceptance Scenarios**:

1. **Given** user has 5 tasks, **When** user asks "What tasks do I have?", **Then** agent lists all 5 tasks with titles and completion status
2. **Given** user has no tasks, **When** user asks "Show my tasks", **Then** agent responds that no tasks exist yet
3. **Given** user A asks to list tasks, **When** agent retrieves via MCP tool, **Then** only user A's tasks are shown (data isolation enforced)

---

### User Story 3 - Complete and Delete Tasks via Chat (Priority: P2)

An authenticated user asks the AI agent to mark a task as complete or delete a task. The agent uses MCP tools to perform the action and confirms the result. Only the user's own tasks can be modified.

**Why this priority**: Enables full task lifecycle management through natural conversation, completing the core CRUD operations.

**Independent Test**: A user with task "Buy milk" sends "Mark 'Buy milk' as done" and receives confirmation. The task shows as completed in the task list.

**Acceptance Scenarios**:

1. **Given** user has incomplete task "Call dentist", **When** user sends "Complete the dentist task", **Then** agent marks task complete and confirms
2. **Given** user has task with ID 5, **When** user sends "Delete task 5", **Then** agent deletes via MCP tool and confirms removal
3. **Given** user tries to complete non-existent task, **When** agent checks via MCP tool, **Then** agent responds that task was not found

---

### User Story 4 - Conversation Persistence Across Sessions (Priority: P2)

A user has a conversation with the AI agent, then closes the browser. When they return later and open the chat, their conversation history is restored and they can continue where they left off.

**Why this priority**: Critical for user experience - conversations should feel continuous, not reset on each visit.

**Independent Test**: User has a chat conversation, closes browser, returns next day, and sees full conversation history preserved.

**Acceptance Scenarios**:

1. **Given** user has previous chat messages, **When** user opens chat interface, **Then** all prior messages are loaded and displayed
2. **Given** user sends new message, **When** conversation is processed, **Then** new message and response are stored with the existing conversation
3. **Given** user starts fresh conversation, **When** first message is sent, **Then** new conversation is created and linked to user

---

### User Story 5 - Error Handling and Graceful Degradation (Priority: P3)

When the AI agent encounters an error (tool failure, invalid request, or system issue), it responds with a helpful error message instead of crashing or providing confusing output. The user understands what went wrong and can try again.

**Why this priority**: Ensures robust user experience even when things go wrong.

**Independent Test**: User asks to delete a task that doesn't exist, and receives a clear "Task not found" message explaining the situation.

**Acceptance Scenarios**:

1. **Given** MCP tool returns error, **When** agent processes response, **Then** agent provides user-friendly error message
2. **Given** user provides ambiguous request, **When** agent cannot determine intent, **Then** agent asks clarifying question
3. **Given** database is temporarily unavailable, **When** MCP tool fails, **Then** agent apologizes and suggests retrying later

---

### Edge Cases

- What happens when a user asks to complete a task that was already completed?
- How does the agent handle requests in languages other than English?
- What occurs when the AI service (OpenAI) is temporarily unavailable?
- How does the system handle extremely long conversation histories? → Uses sliding window to keep recent messages within token budget
- What happens when a user's message exceeds the context window limit? → Sliding window trims oldest messages to fit
- How does the agent respond to requests outside task management scope?

## Requirements *(mandatory)*

### Functional Requirements

**Agent Architecture**
- **FR-001**: System MUST implement AI agent using OpenAI Agents SDK with OpenRouter integration, following openai-agents-sdk skill patterns
- **FR-002**: System MUST use MCP server for ALL task operations - agent never accesses database directly
- **FR-003**: System MUST implement MCP server using mcp-builder skill patterns with Official MCP SDK
- **FR-004**: Agent MUST be a task management assistant focused only on todo operations

**MCP Tools**
- **FR-005**: System MUST provide MCP tool `add_task` that creates tasks for authenticated user only
- **FR-006**: System MUST provide MCP tool `list_tasks` that retrieves only the current user's tasks
- **FR-007**: System MUST provide MCP tool `complete_task` that marks user's own tasks as complete
- **FR-008**: System MUST provide MCP tool `delete_task` that removes user's own tasks
- **FR-009**: System MUST provide MCP tool `update_task` that modifies user's own task details
- **FR-010**: All MCP tools MUST validate user_id ownership before any operation
- **FR-011**: All MCP tools MUST be stateless and use database-backed logic
- **FR-012**: All MCP tools MUST return structured responses with success/error status

**Conversation System**
- **FR-013**: System MUST persist all conversation messages in the database
- **FR-014**: System MUST load conversation history when user opens chat interface
- **FR-015**: System MUST store both user messages and agent responses
- **FR-016**: System MUST maintain exactly one conversation per user that persists and grows continuously
- **FR-017**: Chat endpoint MUST be stateless - no server-side session memory
- **FR-032**: System MUST implement sliding window for conversation context, keeping recent messages within token budget (e.g., 4000 tokens) to prevent context overflow
- **FR-033**: Agent MUST use fuzzy title matching to identify tasks when user references them by name, asking for clarification when multiple tasks match ambiguously

**Stateless Request Cycle**
- **FR-018**: System MUST load conversation from database at start of each request
- **FR-019**: System MUST store user message to database before processing
- **FR-020**: System MUST pass conversation history + new message to agent
- **FR-021**: System MUST store agent response to database after processing
- **FR-022**: System MUST return response to user and clear runtime state

**Integration Requirements**
- **FR-023**: System MUST use existing Better Auth for authentication (no new auth system)
- **FR-024**: System MUST use existing Task database models (no parallel data structures)
- **FR-025**: System MUST integrate with existing frontend chat UI (no ChatKit)
- **FR-026**: System MUST NOT rebuild existing CRUD APIs
- **FR-027**: New chat endpoint MUST require authentication via existing Better Auth

**Error Handling**
- **FR-028**: Agent MUST handle tool errors gracefully with user-friendly messages
- **FR-029**: System MUST handle AI service unavailability by returning a friendly error message explaining the temporary issue and suggesting the user retry shortly
- **FR-030**: System MUST validate user authentication before any chat operation
- **FR-031**: Agent MUST ask for clarification when user intent is ambiguous

### Key Entities

- **Conversation**: Represents a single continuous chat session between a user and the AI agent. Each user has exactly one conversation that persists across sessions and grows continuously with all their messages.

- **Message**: Represents a single message within a conversation, either from the user or the AI agent. Contains the message content, role (user/assistant), and timestamp.

- **MCP Tool Response**: Structured response from MCP tools containing success status, data payload (if applicable), and error message (if failed). Used by agent to determine action outcomes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create tasks via natural language chat with 95% success rate
- **SC-002**: Agent responds to user messages within 5 seconds for 90% of requests
- **SC-003**: Conversation history loads within 2 seconds when user opens chat
- **SC-004**: Zero data leakage - users never see other users' tasks or conversations
- **SC-005**: Agent correctly uses MCP tools for 100% of task operations (no direct database access)
- **SC-006**: Existing Todo app functionality remains 100% operational after AI layer integration
- **SC-007**: Chat interface feels natural - 80% of users complete first task via chat without guidance
- **SC-008**: System handles conversations with 50+ messages without performance degradation
- **SC-009**: All MCP tools enforce user_id validation with 100% accuracy

## Clarifications

### Session 2026-02-08

- Q: How should conversations be organized per user? → A: Single conversation per user - one continuous chat that persists and grows
- Q: How to handle conversation history exceeding context window? → A: Sliding window - keep recent messages within token budget (e.g., last 4000 tokens)
- Q: How should agent identify tasks when user references them in chat? → A: Fuzzy title matching - match closest task title, ask for clarification if ambiguous
- Q: How to handle AI service (OpenAI) unavailability? → A: Return friendly error - apologize, explain temporary issue, suggest retry
- Q: Which LLM model should the agent use? → A: OpenRouter integration with model name from environment variable (per openai-agents-sdk skill)

## Assumptions

- OpenRouter API key and model name are available and configured in environment variables
- Existing database (Neon Postgres) can support additional conversation/message tables
- OpenAI Agents SDK is compatible with the project's Python version
- Existing frontend has or can add a chat UI component
- Agent responds in English only (multi-language support not required for MVP)
- Conversation context window is sufficient for typical user interactions
- Users have stable internet connection for AI API calls

## Dependencies

- OpenAI Agents SDK (via openai-agents-sdk skill)
- Official MCP SDK (via mcp-builder skill)
- Existing Better Auth authentication system
- Existing Task CRUD database models
- Existing Neon Postgres database
- Existing frontend infrastructure

## Out of Scope

- Multi-language support for conversations
- Voice-based task management
- Agent personality customization
- Task prioritization or categorization via AI
- Proactive task reminders from agent
- Integration with external calendar services
- ChatKit or third-party chat UI libraries
- Rewriting existing authentication or CRUD APIs
