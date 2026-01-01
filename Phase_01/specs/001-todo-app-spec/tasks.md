---
description: "Task list for In-Memory Python Console TODO Application"
---

# Tasks: In-Memory Python Console TODO Application

**Input**: Design documents from `/specs/001-todo-app-spec/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure per implementation plan in src/, tests/ directories
- [X] T002 [P] Create requirements.txt with colorama==0.4.6 and pytest==7.4.3
- [X] T003 [P] Create __init__.py files in src/models/, src/services/, src/cli/, src/lib/, tests/unit/, tests/integration/, tests/contract/

---
## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create Task entity definition in src/models/task.py with all required attributes (id, title, description, status, priority, created_at, updated_at)
- [X] T005 Create constants module in src/lib/utils.py with status and priority enums
- [X] T006 Create Task Manager class in src/services/task_manager.py with in-memory storage and ID generation
- [X] T007 Create basic CLI renderer in src/cli/renderer.py with clear screen and basic display functions
- [X] T008 Create main application entry point in src/cli/app.py with basic structure

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and Manage Tasks (Priority: P1) 🎯 MVP

**Goal**: Core functionality allowing users to create, view, update, and delete tasks in a console-based application

**Independent Test**: Can be fully tested by creating a task, viewing it, updating its status, and deleting it. The application provides a complete task management workflow.

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T009 [P] [US1] Contract test for Create Task operation in tests/contract/test_task_contracts.py
- [X] T010 [P] [US1] Contract test for Read/Update/Delete Task operations in tests/contract/test_task_contracts.py

### Implementation for User Story 1

- [X] T011 [P] [US1] Implement Task creation method in src/services/task_manager.py
- [X] T012 [P] [US1] Implement Task retrieval methods in src/services/task_manager.py
- [X] T013 [US1] Implement Task update method in src/services/task_manager.py with validation
- [X] T014 [US1] Implement Task deletion method in src/services/task_manager.py with validation
- [X] T015 [US1] Create task list view renderer in src/cli/renderer.py
- [X] T016 [US1] Create main menu renderer in src/cli/menu.py
- [X] T017 [US1] Implement input validation handler in src/cli/menu.py
- [X] T018 [US1] Implement menu routing logic in src/cli/menu.py
- [X] T019 [US1] Create confirmation dialog for destructive actions in src/cli/menu.py
- [X] T020 [US1] Integrate Task Manager with CLI in src/cli/app.py
- [X] T021 [US1] Add basic error handling in src/cli/app.py

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Filter and Sort Tasks (Priority: P2)

**Goal**: Enable users to filter and sort their tasks by status, priority, and creation date so that they can focus on the most important tasks first

**Independent Test**: Can be fully tested by creating tasks with different statuses and priorities, then applying various filters and sorts to see the results.

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T022 [P] [US2] Contract test for Filter Tasks operation in tests/contract/test_task_contracts.py
- [ ] T023 [P] [US2] Contract test for Sort Tasks operation in tests/contract/test_task_contracts.py

### Implementation for User Story 2

- [ ] T024 [P] [US2] Implement task filtering logic in src/services/task_manager.py
- [ ] T025 [P] [US2] Implement task sorting logic in src/services/task_manager.py
- [ ] T026 [US2] Create filter UI flow in src/cli/menu.py
- [ ] T027 [US2] Create sort selection UI in src/cli/menu.py
- [ ] T028 [US2] Integrate filtering and sorting with CLI renderer in src/cli/renderer.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Task Priority Management (Priority: P3)

**Goal**: Allow users to assign and modify priorities for their tasks (Low, Medium, High) so that they can identify which tasks need immediate attention

**Independent Test**: Can be fully tested by creating tasks with different priorities and verifying they are displayed with appropriate visual indicators.

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T029 [P] [US3] Contract test for Priority assignment in tests/contract/test_task_contracts.py

### Implementation for User Story 3

- [ ] T030 [P] [US3] Enhance task creation to include priority selection in src/cli/menu.py
- [ ] T031 [US3] Enhance task update to include priority modification in src/cli/menu.py
- [ ] T032 [US3] Implement visual indicators for priority in src/cli/renderer.py (e.g., colors, symbols)
- [ ] T033 [US3] Update task list view to show priority indicators in src/cli/renderer.py

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T034 [P] Add status-based views (pending, in-progress, completed) in src/cli/renderer.py
- [X] T035 [P] Add priority-based views (high, medium, low) in src/cli/renderer.py
- [X] T036 Add empty state screens in src/cli/renderer.py
- [X] T037 [P] Add success and error feedback utilities in src/lib/utils.py
- [X] T038 Add graceful exit handling in src/cli/app.py
- [X] T039 [P] Add input validation for edge cases (very long titles/descriptions) in src/cli/menu.py
- [X] T040 [P] Add search functionality in src/services/task_manager.py
- [X] T041 Add search UI flow in src/cli/menu.py
- [X] T042 Update UI to handle edge cases (invalid input, empty lists, non-existent tasks) in src/cli/renderer.py
- [X] T043 [P] Add unit tests for Task entity in tests/unit/test_task.py
- [X] T044 Add unit tests for Task Manager in tests/unit/test_task_manager.py
- [X] T045 Add integration tests for CLI flow in tests/integration/test_cli_flow.py
- [X] T046 Documentation updates in README.md
- [ ] T047 Code cleanup and refactoring
- [ ] T048 Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for Create Task operation in tests/contract/test_task_contracts.py"
Task: "Contract test for Read/Update/Delete Task operations in tests/contract/test_task_contracts.py"

# Launch all models for User Story 1 together:
Task: "Implement Task creation method in src/services/task_manager.py"
Task: "Implement Task retrieval methods in src/services/task_manager.py"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence