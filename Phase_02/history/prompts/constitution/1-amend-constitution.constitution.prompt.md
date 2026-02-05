---
id: 1
title: amend-constitution
stage: constitution
date: 2026-01-07
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: user
command: sp.constitution
labels: ["constitution", "governance", "spec-driven-development"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests: []
---

## Prompt

```
/sp.constitution 📜 The Project Constitution: Multi-User Web TODO
1. Core Philosophy: Spec-Driven Development
The Specification is Truth: No code shall be written, refactored, or deleted without a corresponding update or reference to the files in the /specs directory.

Agentic Workflow: The development follows a strict four-step cycle: Spec → Plan → Task → Implement.

Minimalist Implementation: Do not add "extra" features or "nice-to-haves" unless they are explicitly defined in the specifications.

2. Technical Commandments
All code generated must strictly adhere to this stack. Do not suggest alternatives.

Frontend: Next.js 16+ (App Router), TypeScript, Tailwind CSS.

Backend: FastAPI (Python), SQLModel (ORM), Pydantic v2.

Database: Neon Serverless PostgreSQL.

Authentication: Better Auth (Frontend) with JWT verification via shared BETTER_AUTH_SECRET (Backend).

API Style: Strictly RESTful, using JSON for all exchanges.

3. Security & Multi-Tenancy (The "Iron Wall")
Security is not an afterthought; it is the primary constraint.

User Isolation: Every database query must include a filter for user_id. No user should ever be able to see or modify another user's data.

Stateless Backend: The backend must remain stateless. Use JWTs for session validation; do not use server-side sessions in FastAPI.

Validation: All incoming data must be validated using Pydantic schemas on the backend and Zod (or similar) on the frontend.

4. Architectural Rules
Separation of Concerns: The frontend/ and backend/ directories must remain completely decoupled. They communicate exclusively via HTTPS/REST.

Folder Integrity: Maintain the industry-standard structure. Do not move files outside of their designated directories.

Environment Variables: Never hardcode secrets. Use .env.local for frontend and .env for backend.

5. Coding Standards for the AI
When implementing code, Claude must:

Prioritize Readability: Write code that a beginner can follow. Use descriptive variable names and helpful comments.

Error Handling: Implement graceful error handling (e.g., 404 for missing tasks, 401 for unauthorized access).

Type Safety: Ensure 100% TypeScript coverage on the frontend and proper type hinting in Python.
```

## Response snapshot

Constitution file updated successfully with Multi-User Web TODO project principles. The updated constitution now includes:

1. Spec-Driven Development principle
2. Technical Commandments with stack requirements
3. Security & Multi-Tenancy (The "Iron Wall") principle
4. Architectural Rules
5. Coding Standards for the AI

The constitution also includes governance rules for PHR creation and ADR suggestions. A Sync Impact Report was created showing that dependent templates (.specify/templates/plan-template.md, .specify/templates/spec-template.md, .specify/templates/tasks-template.md) are already aligned with the new constitution.

## Outcome

- ✅ Impact: Updated project constitution with comprehensive principles and governance
- 🧪 Tests: No tests required for constitution update
- 📁 Files: .specify/memory/constitution.md updated
- 🔁 Next prompts: Ready for feature specification and planning
- 🧠 Reflection: Constitution now provides clear guidance for all development activities

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin feature specification following new constitution