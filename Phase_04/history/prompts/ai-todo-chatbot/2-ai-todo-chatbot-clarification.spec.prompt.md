---
id: 2
title: ai-todo-chatbot-clarification
stage: spec
date: 2026-02-08
surface: agent
model: claude-sonnet-4-5-20250929
feature: ai-todo-chatbot
branch: 002-specification-ai-todo
user: user
command: sp.clarify
labels: ["clarification", "specification", "ai-chatbot", "mcp"]
links:
  spec: specs/002-specification-ai-todo/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-specification-ai-todo/spec.md
tests: []
---

## Prompt

```
(sp.clarify command to detect and reduce ambiguity in active feature specification)
```

## Response snapshot

Completed 5 clarification questions for AI Todo Chatbot spec:

| Q# | Question | Answer |
|----|----------|--------|
| 1 | How should conversations be organized per user? | Single conversation per user - one continuous chat |
| 2 | How to handle conversation history exceeding context window? | Sliding window - keep recent messages within token budget |
| 3 | How should agent identify tasks when user references them? | Fuzzy title matching - ask clarification if ambiguous |
| 4 | How to handle AI service unavailability? | Return friendly error - apologize, suggest retry |
| 5 | Which LLM model should the agent use? | OpenRouter with model name from env var (per openai-agents-sdk skill) |

**Spec Updated**: `specs/002-specification-ai-todo/spec.md`

**Sections Modified**:
- Clarifications (new section with session log)
- FR-001 (agent implementation)
- FR-016 (conversation model)
- FR-017, FR-032, FR-033 (new requirements)
- FR-029 (error handling)
- Key Entities (Conversation definition)
- Edge Cases (resolved with sliding window answer)
- Assumptions (OpenRouter API key)

## Outcome

- ✅ Impact: Critical ambiguities resolved before planning
- 🧪 Tests: N/A for clarification
- 📁 Files: specs/002-specification-ai-todo/spec.md updated
- 🔁 Next prompts: Ready for `/sp.plan`
- 🧠 Reflection: All high-impact decisions clarified; spec now has clear guidance on conversation model, context handling, task matching, error handling, and LLM configuration

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run `/sp.plan` to design architecture
