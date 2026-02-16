---
id: 3
title: ai-todo-chatbot-planning
stage: plan
date: 2026-02-08
surface: agent
model: claude-sonnet-4-5-20250929
feature: ai-todo-chatbot
branch: 002-specification-ai-todo
user: user
command: sp.plan
labels: ["planning", "architecture", "ai-chatbot", "mcp", "openai-agents-sdk"]
links:
  spec: specs/002-specification-ai-todo/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-specification-ai-todo/plan.md
  - specs/002-specification-ai-todo/research.md
  - specs/002-specification-ai-todo/data-model.md
  - specs/002-specification-ai-todo/quickstart.md
tests: []
---

## Prompt

```
# sp.plan — Phase III Todo AI Chatbot (Agent + MCP)

[8-step plan overview defining: Repository understanding, Database extension, MCP Server Layer, OpenAI Agent Integration, Stateless Chat API, Frontend Integration, Testing, Deliverables]

Must follow sp.constitution strictly:
- Read existing spec at specs/001-todo-app-auth
- Do NOT rewrite CRUD/Auth
- Use required skills: openai-agent-sdk, mcp-builder
- Custom UI exists → ChatKit NOT used
```

## Response snapshot

Created comprehensive implementation plan for Phase III AI Todo Chatbot layer extending existing Todo app.

**Branch**: `002-specification-ai-todo`
**Plan Path**: `specs/002-specification-ai-todo/plan.md`

**Key Architecture Decisions**:
- LLM: OpenRouter with model from env var (per openai-agents-sdk skill)
- MCP Server: Python FastMCP with Streamable HTTP transport
- Conversation Model: Single conversation per user
- Context Management: Sliding window (~4000 tokens)
- Task Matching: Fuzzy title matching with clarification
- Error Handling: Friendly error messages, suggest retry

**Integration Points with Existing System**:
- Auth: Reuse `backend/src/utils/jwt_auth.py` (Better Auth JWKS)
- Tasks: Reuse `backend/src/services/task_service.py` via MCP tools
- Models: Reference existing Task SQLModel schema
- No rebuilding of CRUD APIs, auth, or models

**New Components**:
- Conversation & Message SQLModel entities
- MCP Server with 5 tools (add_task, list_tasks, complete_task, delete_task, update_task)
- AI Agent with OpenRouter integration
- Chat API endpoint (POST /api/chat)
- Frontend chat UI component

**Artifacts Generated**:
- plan.md - Complete implementation plan with architecture diagrams
- research.md - Technology decisions and rationale
- data-model.md - Conversation/Message entities with SQL schema
- quickstart.md - Step-by-step setup and usage guide

**Constitution Gates**:
- [x] Existing system understood
- [x] Skills referenced
- [x] Statelessness designed
- [x] Data isolation enforced

## Outcome

- ✅ Impact: Complete architecture for AI chatbot layer
- 🧪 Tests: N/A for planning
- 📁 Files: plan.md, research.md, data-model.md, quickstart.md
- 🔁 Next prompts: Ready for `/sp.tasks` to break into implementation tasks
- 🧠 Reflection: Plan respects all constitution principles - extends existing system, uses required skills, maintains statelessness, enforces user isolation

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run `/sp.tasks` following the plan's implementation order
