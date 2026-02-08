<!--
Sync Impact Report:
- Version change: 1.0.0 → 2.0.0
- List of modified principles:
  - Spec-Driven Development → Project Understanding Comes First
  - Technical Commandments → Mandatory Skill Usage Rules
  - Security & Multi-Tenancy → Respect Existing Application Architecture
  - Architectural Rules → AI Agent Role Definition
  - Coding Standards for the AI → MCP Server Responsibility
  - [PRINCIPLE_6_NAME] → Conversation Persistence
  - (NEW) Frontend Integration
  - (NEW) Development Methodology (Agentic Dev Stack)
  - (NEW) Prohibited Actions
  - (NEW) Success Definition
- Added sections: Conversation Persistence, Frontend Integration, Development Methodology, Prohibited Actions, Success Definition
- Removed sections: Technical Commandments (framework-specific stack rules), Additional Constraints
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (Constitution Check section compatible)
  - ✅ .specify/templates/spec-template.md (aligns with requirements)
  - ✅ .specify/templates/tasks-template.md (follows agentic workflow)
  - ✅ .specify/templates/phr-template.prompt.md (PHR requirements met)
- Follow-up TODOs: None
- Rationale for MAJOR version: Complete redefinition of project scope from base TODO app (Phase I/II) to AI Chatbot layer (Phase III). Principles fundamentally changed from CRUD app rules to AI agent orchestration rules.
-->

# Phase III - Todo AI Chatbot Constitution

This constitution defines the mandatory rules, boundaries, and workflow principles that MUST be followed while designing, planning, and implementing this project using Claude Code and Spec-Kit Plus.

## Core Principles

### 1. Project Understanding Comes First

Before performing any design, planning, or generation tasks, the agent MUST first understand the existing system.

**Mandatory Pre-Work:**
- Read the entire existing project structure
- Understand current backend and frontend architecture
- Review how authentication works (Better Auth)
- Understand how CRUD operations for tasks are already implemented
- Avoid rewriting or duplicating existing functionality

**Existing System Specification:** The full stack Todo app has already been built and is functional. Its specifications are located at `specs/001-todo-app-auth`. The agent MUST read and understand this spec fully before proposing any architecture or changes in Phase III.

**Rationale:** Phase III is an AI layer on top of an existing system, not a new system. Understanding prevents duplication and ensures seamless integration.

### 2. Mandatory Skill Usage Rules

This project relies on two custom skills. These skills MUST always be used correctly.

**Skill 1 - openai-agents-sdk:** Building AI agent logic using OpenAI Agents SDK. Whenever the task involves agent design, tool calling logic, agent prompts, agent runner setup, message handling for LLM, or conversation orchestration:
- The agent MUST first read the openai-agents-sdk skill documentation
- Then follow its standards, patterns, and SDK usage rules
- No agent logic should be written without aligning with this skill

**Skill 2 - mcp-builder:** Creating MCP server and MCP tools. Whenever the task involves MCP server setup, tool schema definitions, tool handlers, tool registration, MCP SDK usage, or communication between agent and tools:
- The agent MUST first read the mcp-builder skill documentation
- Then implement MCP tools strictly following that skill's structure
- No MCP server or tool code should be written without aligning with this skill

**Rationale:** These skills contain tested patterns and best practices. Deviating from them introduces inconsistency and potential bugs.

### 3. Respect Existing Application Architecture

Phase III MUST extend the system — not replace it.

**The following already exist and MUST NOT be rebuilt:**
- Task CRUD APIs
- Database models for tasks
- Authentication system (Better Auth)
- User system
- Base FastAPI app structure

**Rationale:** AI components must integrate with existing services, not create parallel systems. Rebuilding wastes effort and creates maintenance burden.

### 4. AI Agent Role Definition

The AI agent is a task management assistant, not a general chatbot.

**The agent:**
- MUST use MCP tools for ALL task operations
- MUST NEVER directly access the database
- MUST NEVER simulate task actions with text only
- MUST always confirm successful actions
- MUST handle errors gracefully using tool responses

**Rationale:** The agent is a decision maker, not an executor. Execution happens only through MCP tools. This separation ensures consistency, auditability, and proper error handling.

### 5. MCP Server Responsibility

The MCP server is the ONLY layer allowed to perform task mutations.

**MCP tools MUST:**
- Be stateless
- Use database-backed logic
- Validate user_id ownership on every operation
- Return structured responses with success/error status
- Return structured error messages for debugging

**Rationale:** Centralizing mutations in the MCP layer ensures data integrity, proper authorization, and consistent error handling across all agent interactions.

### 6. Conversation Persistence

Conversations MUST persist across sessions to enable continuous task management.

**Requirements:**
- Store conversation history per user
- Load previous context when user returns
- Support conversation resumption
- Maintain conversation metadata (timestamps, status)

**Rationale:** Users expect their chat history to be preserved. Session-to-session continuity is essential for a productive assistant experience.

### 7. Frontend Integration

The AI backend MUST integrate with the existing frontend.

**Requirements:**
- NO ChatKit or third-party chat UI libraries
- Reuse existing authentication flow
- Integrate with current frontend architecture
- Maintain consistent UX with existing Todo app

**Rationale:** ChatKit and similar libraries add unnecessary complexity and dependency risk. The AI layer should feel like a natural extension of the existing Todo app.

### 8. Development Methodology (Agentic Dev Stack)

All work MUST follow this order:

1. `/sp.specify` → Define WHAT to build
2. `/sp.plan` → Define HOW components connect
3. `/sp.tasks` → Break into small actionable tasks
4. Claude Code Implementation → Generate code from tasks

**Rationale:** No direct coding before specs and planning. This ensures alignment, traceability, and reduces rework.

### 9. Prohibited Actions

The agent MUST NEVER:

- ❌ Rebuild existing CRUD APIs
- ❌ Replace authentication system
- ❌ Add ChatKit UI or similar third-party chat libraries
- ❌ Store server-side memory (stateless only)
- ❌ Let agent access database directly
- ❌ Ignore skill documentation

**Rationale:** These constraints prevent scope creep, architectural violations, and unnecessary complexity.

### 10. Success Definition

The system is considered correctly built when:

- ✅ AI can manage tasks via natural language
- ✅ Agent uses MCP tools for every action
- ✅ Conversations persist across sessions
- ✅ Server remains stateless
- ✅ Existing app remains functional and unchanged
- ✅ AI layer feels like a natural extension of the Todo app

**Rationale:** These success criteria are measurable and ensure the AI layer adds value without disrupting the existing system.

## Additional Constraints

- All code MUST follow Python (FastAPI) for backend and TypeScript/Next.js for frontend
- Environment variables MUST be used for secrets (never hardcode)
- Error messages MUST be user-friendly while preserving debug information
- All new endpoints MUST require authentication via existing Better Auth system

## Development Workflow

**Agentic Workflow:** The development follows a strict four-step cycle: Spec → Plan → Task → Implement. All outputs strictly follow the user intent. Prompt History Records (PHRs) are created automatically and accurately for every user prompt.

## Governance

**PHR Requirements:** Record every user input verbatim in a Prompt History Record (PHR) after every user prompt.

**PHR Routing** (all under `history/prompts/`):
- Constitution → `history/prompts/constitution/`
- Feature-specific → `history/prompts/<feature-name>/`
- General → `history/prompts/general/`

**ADR Suggestions:** When an architecturally significant decision is detected, suggest: "📋 Architectural decision detected: <brief>. Document? Run `/sp.adr <title>`." Never auto-create ADRs; require user consent.

**Version**: 2.0.0 | **Ratified**: 2026-01-07 | **Last Amended**: 2026-02-08
