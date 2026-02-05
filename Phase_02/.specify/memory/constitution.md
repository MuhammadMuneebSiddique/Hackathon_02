<!--
Sync Impact Report:
- Version change: N/A → 1.0.0
- List of modified principles: N/A (new constitution)
- Added sections: All principles based on Multi-User Web TODO project constitution
- Removed sections: None
- Templates requiring updates: ✅ .specify/templates/plan-template.md (already has Constitution Check section), ✅ .specify/templates/spec-template.md (aligns with requirements), ✅ .specify/templates/tasks-template.md (follows agentic workflow), ✅ .specify/templates/phr-template.md (PHR requirements met)
- Follow-up TODOs: None
-->
# Multi-User Web TODO Constitution

## Core Principles

### Spec-Driven Development
The Specification is Truth: No code shall be written, refactored, or deleted without a corresponding update or reference to the files in the /specs directory. Agentic Workflow: The development follows a strict four-step cycle: Spec → Plan → Task → Implement. Minimalist Implementation: Do not add "extra" features or "nice-to-haves" unless they are explicitly defined in the specifications.

### Technical Commandments
All code generated must strictly adhere to this stack. Do not suggest alternatives. Frontend: Next.js 16+ (App Router), TypeScript, Tailwind CSS. Backend: FastAPI (Python), SQLModel (ORM), Pydantic v2. Database: Neon Serverless PostgreSQL. Authentication: Better Auth (Frontend) with JWT verification via shared BETTER_AUTH_SECRET (Backend). API Style: Strictly RESTful, using JSON for all exchanges.

### Security & Multi-Tenancy (The "Iron Wall")
Security is not an afterthought; it is the primary constraint. User Isolation: Every database query must include a filter for user_id. No user should ever be able to see or modify another user's data. Stateless Backend: The backend must remain stateless. Use JWTs for session validation; do not use server-side sessions in FastAPI. Validation: All incoming data must be validated using Pydantic schemas on the backend and Zod (or similar) on the frontend.

### Architectural Rules
Separation of Concerns: The frontend/ and backend/ directories must remain completely decoupled. They communicate exclusively via HTTPS/REST. Folder Integrity: Maintain the industry-standard structure. Do not move files outside of their designated directories. Environment Variables: Never hardcode secrets. Use .env.local for frontend and .env for backend.

### Coding Standards for the AI
When implementing code, Claude must: Prioritize Readability: Write code that a beginner can follow. Use descriptive variable names and helpful comments. Error Handling: Implement graceful error handling (e.g., 404 for missing tasks, 401 for unauthorized access). Type Safety: Ensure 100% TypeScript coverage on the frontend and proper type hinting in Python.

### [PRINCIPLE_6_NAME]


[PRINCIPLE__DESCRIPTION]

## Additional Constraints
Security & Multi-Tenancy requirements as specified in Principle 3, plus any additional constraints.

## Development Workflow
Agentic Workflow: The development follows a strict four-step cycle: Spec → Plan → Task → Implement. All outputs strictly follow the user intent. Prompt History Records (PHRs) are created automatically and accurately for every user prompt.

## Governance
Record every user input verbatim in a Prompt History Record (PHR) after every user prompt. PHR routing (all under `history/prompts/`): Constitution → `history/prompts/constitution/`, Feature-specific → `history/prompts/<feature-name>/`, General → `history/prompts/general/`. ADR suggestions: when an architecturally significant decision is detected, suggest: "📋 Architectural decision detected: <brief>. Document? Run `/sp.adr <title>`." Never auto‑create ADRs; require user consent.

**Version**: 1.0.0 | **Ratified**: 2026-01-07 | **Last Amended**: 2026-01-07
