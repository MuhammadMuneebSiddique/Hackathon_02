# Tasks: AI Todo Chatbot (Agent + MCP Architecture)

**Input**: Design documents from `/specs/002-specification-ai-todo/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, research.md, quickstart.md

**Tests**: Tests are OPTIONAL for this feature - not explicitly requested in specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/` at repository root
- **Frontend**: `frontend/app/` for Next.js App Router
- Paths shown below use this structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and review existing system

- [x] T001 Review existing Todo app spec at specs/001-todo-app-auth/ and understand Task model, auth flow, and API structure
- [x] T002 [P] Install OpenAI Agents SDK in backend: `pip install openai-agents` or `uv add openai-agents`
- [x] T003 [P] Install MCP SDK in backend: `pip install mcp` or `uv add mcp`
- [x] T004 Add environment variables to backend/.env: OPENROUTER_API_KEY, OPENROUTER_MODEL

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create Conversation SQLModel in backend/src/models/conversation.py (id, user_id unique, created_at, updated_at)
- [x] T006 [P] Create Message SQLModel in backend/src/models/message.py (id, conversation_id, role enum, content, created_at)
- [x] T007 [P] Create conversation schemas in backend/src/schemas/conversation.py (ConversationCreate, ConversationRead, MessageCreate, MessageRead)
- [ ] T008 Create database migration for conversations and messages tables with indexes
- [x] T009 Update backend/src/database/database.py to include new Conversation and Message models in create_db_and_tables()
- [x] T010 Create MCP server skeleton in backend/src/mcp/server.py using FastMCP with tool registry setup
- [x] T011 Create ConversationService in backend/src/services/conversation_service.py (get_or_create, get_messages, add_message, get_context_messages with sliding window)
- [x] T012 Create AI agent configuration in backend/src/agent/config.py (OpenRouter AsyncOpenAI client, RunConfig with model from env)

- [x] T013 Create agent instructions in backend/src/agent/instructions.py (task management assistant behavior, fuzzy matching guidance)
- [x] T014 Create chat request/response schemas in backend/src/schemas/chat.py (ChatRequest, ChatResponse, ChatHistoryResponse)
- [x] T015 Create chat endpoint skeleton in backend/src/routes/chat.py with POST /api/chat and GET /api/chat/history routes (authenticated)
- [ ] T013 Create agent instructions in backend/src/agent/instructions.py (task management assistant behavior, fuzzy matching guidance)
- [ ] T014 Create chat request/response schemas in backend/src/schemas/chat.py (ChatRequest, ChatResponse, ChatHistoryResponse)
- [ ] T015 Create chat endpoint skeleton in backend/src/routes/chat.py with POST /api/chat and GET /api/chat/history routes (authenticated)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Natural Language Task Creation (Priority: P1) 🎯 MVP

**Goal**: Users can create tasks via natural language chat

**Independent Test**: A logged-in user sends "Add a task to buy groceries" and receives confirmation that the task was created.

### Implementation for User Story 1

- [x] T016 [US1] Implement MCP tool add_task in backend/src/mcp/tools/add_task.py (validate user_id, create via TaskService, return structured response)
- [x] T017 [US1] Register add_task tool in MCP server at backend/src/mcp/server.py (via agent tools)
- [x] T018 [US1] Create ChatService in backend/src/services/chat_service.py with run_agent() method that connects agent to MCP server
- [x] T019 [US1] Implement full POST /api/chat flow in backend/src/routes/chat.py: auth → get/create conversation → store user message → load context → run agent → store response → return
- [x] T020 [US1] Add error handling in chat endpoint for AI service unavailability with friendly error message

**Checkpoint**: At this point, User Story 1 should be fully functional - users can create tasks via natural language

---

## Phase 4: User Story 2 - View and List Tasks via Chat (Priority: P1)

**Goal**: Users can view their tasks through natural language

**Independent Test**: A user with tasks sends "Show my tasks" and receives a formatted list of their tasks.

### Implementation for User Story 2

- [x] T021 [US2] Implement MCP tool list_tasks in backend/src/mcp/tools/list_tasks.py (validate user_id, fetch via TaskService with filters, return structured response)
- [x] T022 [US2] Register list_tasks tool in MCP server at backend/src/mcp/server.py (via agent tools)
- [x] T023 [US2] Add fuzzy task matching utility in backend/src/utils/task_matching.py (fuzzy_match_task function with ambiguity detection)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - MVP complete

---

## Phase 5: User Story 3 - Complete and Delete Tasks via Chat (Priority: P2)

**Goal**: Users can complete and delete tasks via natural language

**Independent Test**: A user with task "Buy milk" sends "Mark 'Buy milk' as done" and receives confirmation.

### Implementation for User Story 3

- [x] T024 [P] [US3] Implement MCP tool complete_task in backend/src/mcp/tools/complete_task.py (fuzzy match, validate ownership, update via TaskService)
- [x] T025 [P] [US3] Implement MCP tool delete_task in backend/src/mcp/tools/delete_task.py (fuzzy match, validate ownership, delete via TaskService)
- [x] T026 [P] [US3] Implement MCP tool update_task in backend/src/mcp/tools/update_task.py (fuzzy match, partial updates, validate ownership)
- [x] T027 [US3] Register complete_task, delete_task, update_task tools in MCP server at backend/src/mcp/server.py (via agent tools)

**Checkpoint**: All core task operations now work via natural language chat

---

## Phase 6: User Story 4 - Conversation Persistence Across Sessions (Priority: P2)

**Goal**: Chat history persists across browser sessions

**Independent Test**: User has a chat conversation, closes browser, returns next day, and sees full history.

### Implementation for User Story 4

- [x] T028 [US4] Implement GET /api/chat/history endpoint in backend/src/routes/chat.py (auth → get conversation → return messages ordered by created_at)
- [x] T029 [US4] Create frontend chat page at frontend/app/chat/page.jsx with chat UI component
- [x] T030 [US4] Create chat message component in frontend/app/components/chatMessage.jsx for displaying user/assistant messages
- [x] T031 [US4] Create chat input component in frontend/app/components/chatInput.jsx for message submission
- [x] T032 [US4] Implement chat API client functions in frontend/util/chat-api.js (sendMessage, getChatHistory)
- [x] T033 [US4] Add chat navigation link to frontend sidebar/header in existing navigation components

**Checkpoint**: Full conversation persistence working - users see their chat history on return

---

## Phase 7: User Story 5 - Error Handling and Graceful Degradation (Priority: P3)

**Goal**: Agent handles errors gracefully with helpful messages

**Independent Test**: User asks to delete a non-existent task and receives a clear "Task not found" message.

### Implementation for User Story 5

- [x] T034 [US5] Add task not found handling in all MCP tools with user-friendly error messages
- [x] T035 [US5] Add ambiguous task match handling in complete_task, delete_task, update_task tools (list options, ask for clarification)
- [x] T036 [US5] Add error handling in chat endpoint for database errors with friendly retry suggestion
- [x] T037 [US5] Add frontend error state handling in chat components for failed API calls
- [x] T038 [US5] Add loading states in frontend chat components during message submission

**Checkpoint**: All user stories should now be independently functional with robust error handling

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T039 [P] Update backend/README.md with AI chatbot setup instructions (environment variables, dependencies)
- [ ] T040 [P] Add chat endpoint documentation to backend API docs
- [ ] T041 Verify all MCP tools enforce user_id validation with 100% accuracy
- [ ] T042 Test conversation persistence with 50+ messages for performance
- [ ] T043 Test natural language task creation with 95% success rate target
- [ ] T044 Verify existing Todo app CRUD functionality remains 100% operational

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 and US2 can proceed sequentially (P1 priority)
  - US3 can start after US2 (needs list_tasks for matching)
  - US4 can start after Foundational (independent of task tools)
  - US5 can start after US3 complete (needs all tools for error handling)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after US1 - needs add_task working for testing
- **User Story 3 (P2)**: Can start after US2 - needs list_tasks for fuzzy matching feature
- **User Story 4 (P2)**: Can start after Foundational - Independent of task tools, only needs conversation models
- **User Story 5 (P3)**: Can start after US3 - needs all task tools for comprehensive error handling

### Within Each User Story

- Tools before registration
- Registration before agent integration
- Agent integration before chat endpoint completion

### Parallel Opportunities

- T002 and T003 (dependencies installation) can run in parallel
- T005 and T006 (model creation) can run in parallel
- T024, T025, T026 (complete/delete/update tools) can run in parallel
- T039 and T040 (documentation) can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test creating task via "Add a task to buy groceries"
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test task creation via chat → Deploy/Demo (MVP!)
3. Add User Story 2 → Test task listing via chat → Deploy/Demo
4. Add User Story 3 → Test complete/delete via chat → Deploy/Demo
5. Add User Story 4 → Test persistence → Deploy/Demo
6. Add User Story 5 → Test error handling → Deploy/Demo
7. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Skills required: Read openai-agents-sdk and mcp-builder skills before implementation
- NO ChatKit - use custom UI only
- NO rebuilding existing CRUD/Auth - extend only
