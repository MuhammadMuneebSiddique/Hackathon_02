---
id: 2
title: phase-iii-ai-chatbot-constitution
stage: constitution
date: 2026-02-08
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: 002-specification-ai-todo
user: user
command: sp.constitution
labels: ["constitution", "ai-chatbot", "mcp", "openai-agents-sdk", "phase-iii"]
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
Project: Phase III – Todo AI Chatbot (Agent + MCP Architecture)

This constitution defines the mandatory rules, boundaries, and workflow principles that must be followed while designing, planning, and implementing this project using Claude Code and Spec-Kit Plus.

🧠 1. Project Understanding Comes First

Before performing any design, planning, or generation tasks, the agent MUST first understand the existing system.

Mandatory Pre-Work

The agent must:

Read the entire existing project structure

Understand current backend and frontend architecture

Review how authentication works (Better Auth)

Understand how CRUD operations for tasks are already implemented

Avoid rewriting or duplicating existing functionality

Existing System Specification

The full stack Todo app has already been built and is functional.
Its specifications are located at:

specs/001-todo-app-auth


⚠️ The agent must read and understand this spec fully before proposing any architecture or changes in Phase III.

Phase III is an AI layer on top of an existing system, not a new system.

🛠 2. Mandatory Skill Usage Rules

This project relies on two custom skills. These skills must always be used correctly.

🔹 Skill 1 — openai-agent-sdk

Purpose: Building AI agent logic using OpenAI Agents SDK

Whenever the task involves:

Agent design

Tool calling logic

Agent prompts

Agent runner setup

Message handling for LLM

Conversation orchestration

👉 The agent MUST first read the openai-agent-sdk skill documentation
👉 Then follow its standards, patterns, and SDK usage rules

No agent logic should be written without aligning with this skill.

🔹 Skill 2 — mcp-builder

Purpose: Creating MCP server and MCP tools

Whenever the task involves:

MCP server setup

Tool schema definitions

Tool handlers

Tool registration

MCP SDK usage

Communication between agent and tools

👉 The agent MUST first read the mcp-builder skill documentation
👉 Then implement MCP tools strictly following that skill's structure

No MCP server or tool
🧩 3. Respect Existing Application Architecture

Phase III must extend the system — not replace it.

The following already exist and MUST NOT be rebuilt:

Task CRUD APIs

Database models for tasks

Authentication system (Better Auth)

User system

Base FastAPI app structure

AI components must integrate with existing services, not create parallel systems.

🤖 4. AI Agent Role Definition

The AI agent is a task management assistant, not a general chatbot.

The agent:

Must use MCP tools for ALL task operations

Must NEVER directly access the database

Must NEVER simulate task actions with text only

Must always confirm successful actions

Must handle errors gracefully using tool responses

The agent is a decision maker, not an executor.
Execution happens only through MCP tools.

🔌 5. MCP Server Responsibility

The MCP server is the only layer allowed to perform task mutations.

MCP tools must:

Be stateless

Use database-backed logic

Validate user_id ownership

Return structured responses

Return st
❌ Remove ChatKit from all architecture, specs, and plans
✅ AI backend must integrate with the existing frontend

🧱 8. Development Methodology (Agentic Dev Stack)

All work must follow this order:

sp.specification → Define WHAT to build

sp.plan → Define HOW components connect

sp.task → Break into small actionable tasks

Claude Code Implementation → Generate code from tasks

No direct coding before specs and planning.

🚫 9. Things the Agent Must Never Do

❌ Rebuild existing CRUD APIs

❌ Replace authentication system

❌ Add ChatKit UI

❌ Store server-side memory

❌ Let agent access database directly

❌ Ignore skill documentation

✅ 10. Success Definition

The system is considered correctly built when:

AI can manage tasks via natural language

Agent uses MCP tools for every action

Conversations persist across sessions

Server remains stateless

Existing app remains functional and unchanged

AI layer feels like a natural extension of the Todo app

This constitution acts as the
```

## Response snapshot

Constitution updated from version 1.0.0 to 2.0.0 (MAJOR version bump). The complete redefinition changes the project scope from base TODO app (Phase I/II) to AI Chatbot layer (Phase III). Key changes:

**Updated Principles:**
1. Project Understanding Comes First - Must read existing specs at `specs/001-todo-app-auth`
2. Mandatory Skill Usage Rules - openai-agents-sdk and mcp-builder skills required
3. Respect Existing Application Architecture - Do not rebuild existing CRUD APIs, auth, or user system
4. AI Agent Role Definition - Agent is a task management assistant, uses MCP tools for ALL operations
5. MCP Server Responsibility - Only layer allowed to perform task mutations, must validate user_id
6. Conversation Persistence - Store conversation history per user, support resumption
7. Frontend Integration - No ChatKit, reuse existing auth, integrate with current frontend
8. Development Methodology (Agentic Dev Stack) - Spec → Plan → Task → Implement order
9. Prohibited Actions - No rebuilding, no ChatKit, no server-side memory, no direct DB access
10. Success Definition - AI manages tasks via natural language, MCP tools used, conversations persist

**Removed:** Technical Commandments (framework-specific stack rules now in Additional Constraints)

**Sync Impact Report:** All templates verified as compatible with new constitution.

## Outcome

- ✅ Impact: Constitution completely redefined for Phase III AI Chatbot layer
- 🧪 Tests: No tests required for constitution update
- 📁 Files: .specify/memory/constitution.md updated to v2.0.0
- 🔁 Next prompts: Ready for feature specification (`/sp.specify`) following new constitution
- 🧠 Reflection: Constitution now provides clear guidance for AI layer development with MCP architecture

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin feature specification with `/sp.specify` following the new Phase III constitution principles
