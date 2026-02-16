# Research: AI Todo Chatbot (Agent + MCP Architecture)

**Feature**: 002-specification-ai-todo
**Date**: 2026-02-08

## Overview

This document captures research findings and decisions made during the planning phase for the AI Todo Chatbot feature.

## Technology Decisions

### LLM Provider Integration

**Decision**: Use OpenRouter with model name from environment variable

**Rationale**:
- User explicitly required OpenRouter integration per openai-agents-sdk skill
- Allows flexible model selection without code changes
- Supports free tier models for development/testing
- Follows openai-agents-sdk skill pattern using AsyncOpenAI with custom base_url

**Implementation**:
```python
from agents import AsyncOpenAI, OpenAIChatCompletionsModel

external_provider = AsyncOpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1",
)

model = OpenAIChatCompletionsModel(
    openai_client=external_provider,
    model=os.getenv("OPENROUTER_MODEL"),  # e.g., "openai/gpt-oss-20b:free"
)
```

**Alternatives Considered**:
- Direct Gemini API - Rejected per user requirement for OpenRouter
- OpenAI API directly - Rejected per user requirement
- LiteLLM - Rejected due to quota issues (per skill documentation)

### MCP Server Framework

**Decision**: Use Official MCP SDK with FastMCP (Python)

**Rationale**:
- Aligns with mcp-builder skill recommendations
- Python matches existing backend technology stack
- FastMCP provides simple decorator-based tool registration
- Streamable HTTP transport suitable for production

**Implementation Pattern** (per mcp-builder skill):
```python
from mcp.server import FastMCP

mcp = FastMCP("Todo Task MCP Server")

@mcp.tool()
async def add_task(title: str, description: str = None, user_id: str = None) -> dict:
    """Create a new task for the user."""
    # Validate user_id
    # Create task via existing TaskService
    # Return structured response
```

**Alternatives Considered**:
- TypeScript MCP SDK - Rejected to maintain single-language backend

### Conversation Model

**Decision**: Single conversation per user with continuous growth

**Rationale**:
- Simpler UX - users have one ongoing conversation with their assistant
- Matches typical personal assistant mental model
- Reduces UI complexity (no conversation management needed)
- Clarification session confirmed this approach

**Implementation**:
- `conversations` table has UNIQUE constraint on `user_id`
- First message automatically creates conversation
- All subsequent messages append to same conversation

**Alternatives Considered**:
- Multiple named conversations - Rejected as unnecessary complexity for MVP
- Auto-archiving conversations - Rejected as adds complexity without clear benefit

### Context Window Management

**Decision**: Sliding window with token budget (~4000 tokens)

**Rationale**:
- Prevents context overflow errors
- Task management typically doesn't need very old context
- Recent messages contain most relevant information
- 4000 tokens provides ~10-15 message pairs of context

**Implementation**:
```python
def get_messages_for_context(conversation_id: int, max_tokens: int = 4000) -> list:
    """Fetch recent messages within token budget."""
    messages = fetch_recent_messages(conversation_id, limit=50)

    # Estimate tokens (rough: 1 token ≈ 4 characters)
    total_tokens = 0
    context_messages = []

    for msg in reversed(messages):  # Start from most recent
        msg_tokens = len(msg.content) // 4
        if total_tokens + msg_tokens > max_tokens:
            break
        context_messages.insert(0, msg)
        total_tokens += msg_tokens

    return context_messages
```

**Alternatives Considered**:
- Summarization - Rejected due to implementation complexity
- No limit - Rejected due to model token limits
- Fixed message count - Rejected in favor of token-based approach

### Task Identification Method

**Decision**: Fuzzy title matching with clarification for ambiguity

**Rationale**:
- Most natural for conversational interfaces
- Users typically reference tasks by description, not ID
- Fuzzy matching handles partial names and typos
- Clarification prevents wrong operations

**Implementation Approach**:
```python
def fuzzy_match_task(tasks: list, query: str) -> Task | None | list:
    """Find task by fuzzy title match.

    Returns:
        Task: Single match found
        None: No match found
        list[Task]: Multiple matches (ambiguous)
    """
    query_lower = query.lower()
    matches = []

    for task in tasks:
        if query_lower in task.title.lower():
            matches.append(task)

    if len(matches) == 1:
        return matches[0]
    elif len(matches) > 1:
        return matches  # Ambiguous - need clarification
    return None
```

**Agent Behavior**:
- Single match: Proceed with operation
- No match: Inform user task not found
- Multiple matches: List options and ask user to clarify

**Alternatives Considered**:
- Exact match only - Rejected as poor UX
- Task ID based - Rejected as unnatural for chat
- Hybrid approach - Rejected as adds complexity without clear benefit

### AI Service Error Handling

**Decision**: Return friendly error message, suggest retry

**Rationale**:
- Practical for MVP scope
- Queueing adds significant complexity
- Task management can tolerate brief delays
- Clear communication manages user expectations

**Implementation**:
```python
try:
    result = await Runner.run(agent, message, config=config)
except Exception as e:
    return {
        "response": "I'm having trouble connecting right now. Please try again in a moment.",
        "error": True
    }
```

**Alternatives Considered**:
- Message queueing - Rejected as adds complexity
- Cached responses - Rejected as doesn't fit task management context
- Fail silently - Rejected as poor UX

## Integration Decisions

### Existing System Integration

**Decision**: Extend existing services, no parallel implementations

**Rationale**:
- Constitution principle: "Respect Existing Application Architecture"
- Existing TaskService has proven business logic
- Avoids code duplication
- Maintains consistency with CRUD API behavior

**Integration Points**:
- Auth: Use existing `jwt_auth.py` for user validation
- Tasks: Reuse `TaskService` class for database operations
- Models: Reference existing Task SQLModel schema

### Authentication for Chat

**Decision**: Use existing Better Auth JWT validation

**Rationale**:
- Consistent with existing API security
- No new authentication mechanisms
- JWT contains user_id for isolation

**Implementation**:
- Chat endpoint uses same `get_current_user` dependency as task endpoints
- MCP tools receive user_id from authenticated context

## Performance Considerations

### Database Queries

**Concern**: Loading conversation history could be slow

**Mitigation**:
- Index on `messages(conversation_id, created_at DESC)`
- Limit query to recent messages (sliding window)
- Consider pagination for very long histories

### Token Estimation

**Concern**: Accurate token counting important for context window

**Mitigation**:
- Use conservative character-based estimation (1 token ≈ 4 chars)
- Leave buffer for system message and response
- Monitor actual usage and adjust if needed

### MCP Tool Performance

**Concern**: Tool calls add latency

**Mitigation**:
- Cache tools list on agent initialization
- Use efficient database queries with indexes
- Profile and optimize hot paths

## Security Considerations

### User Isolation

**Requirement**: Users must never see other users' data

**Implementation**:
- All MCP tools validate user_id before operations
- Conversation queries filtered by user_id
- Message access scoped to user's conversation

### Input Validation

**Requirement**: All inputs must be validated

**Implementation**:
- Pydantic schemas for API requests
- MCP tool parameter validation
- SQLModel constraints on database fields

### Error Information Disclosure

**Requirement**: Errors shouldn't expose internal details

**Implementation**:
- User-friendly error messages
- Log detailed errors server-side
- Return generic messages to client

## Testing Strategy

### Unit Tests

- Test each MCP tool independently
- Test fuzzy matching logic
- Test token estimation
- Test sliding window logic

### Integration Tests

- Test full chat request cycle
- Test agent with MCP tools
- Test conversation persistence
- Test error handling paths

### End-to-End Tests

- Test natural language task creation
- Test task listing via chat
- Test task completion/deletion
- Test error scenarios

## References

- openai-agents-sdk skill documentation
- mcp-builder skill documentation
- Existing spec: specs/001-todo-app-auth
- Existing backend: backend/src/
