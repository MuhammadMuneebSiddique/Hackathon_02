# MCP Server Setup Guide

## Overview

The MCP (Model Context Protocol) server exposes task management tools to the AI agent. The agent connects to this server via streamable HTTP to perform all task operations.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FastAPI Backend                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Chat Endpoint (/api/chat)                            │  │
│  │  • Receives user message                              │  │
│  │  • Creates/get conversation                           │  │
│  │  • Calls ChatService.run_agent()                      │  │
│  └────────────────────────┬──────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  ChatService                                         │  │
│  │  • Initializes MCP client                            │  │
│  │  • Creates agent with MCP tools                      │  │
│  │  • Runs agent with context                           │  │
│  └────────────────────────┬──────────────────────────────┘  │
│                           │ MCP Protocol                     │
│                           ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  MCP Server (localhost:9000)                          │  │
│  │  • add_task    • list_tasks                          │  │
│  │  • complete_task • delete_task                       │  │
│  │  • update_task                                       │  │
│  └────────────────────────┬──────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  TaskService (Database)                               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Step 1: Start the MCP Server

The MCP server must be running before starting the main FastAPI application.

### Option A: Using the run script

```bash
cd backend
python run_mcp_server.py
```

This will start the MCP server on `http://127.0.0.1:9000/mcp`.

### Option B: Custom port/host

```bash
# Set environment variables
export MCP_HOST=127.0.0.1
export MCP_PORT=9000

# Run the server
python run_mcp_server.py
```

### Option C: Using uvicorn directly

```bash
cd backend
uvicorn src.task_mcp.server:mcp --app-dir src --host 127.0.0.1 --port 9000
```

**Note**: The `mcp` object in `src.task_mcp.server` is a FastMCP instance with streamable HTTP transport configured.

## Step 2: Verify MCP Server is Running

Open another terminal and test:

```bash
curl http://localhost:9000/mcp
```

You should see a JSON response or MCP protocol info (not an error).

## Step 3: Start the FastAPI Application

With the MCP server running, start the main backend:

```bash
cd backend
uvicorn main:app --reload --port 8001
```

Or:

```bash
python main.py
```

The application will:
1. Initialize database tables
2. Start the FastAPI server on port 8001
3. Chat endpoint will now be able to connect to MCP server

## Step 4: Test the Integration

1. Log in via the frontend
2. Access the chat interface
3. Send a message like: "Create a task to buy groceries"
4. Check the logs:
   - MCP server should show tool calls
   - Backend should show agent using tools

## Tool Implementation

All MCP tools are implemented in `backend/src/task_mcp/tools/`:

- `add_task.py` - Create new task with user_id validation
- `list_tasks.py` - Get user's tasks with optional filtering
- `complete_task.py` - Mark task complete via fuzzy title match
- `delete_task.py` - Delete task via fuzzy title match
- `update_task.py` - Update task title/description via fuzzy match

Each tool:
- Accepts `user_id` as required parameter (enforces data isolation)
- Opens a new database session per call (stateless)
- Performs operation and returns human-readable string result
- Uses existing TaskService for database operations

## Agent Connection Details

The ChatService (`src/services/chat_service.py`) configures the MCP client:

```python
from agents.mcp import MCPServerStreamableHttp, MCPServerStreamableHttpParams

mcp_params = MCPServerStreamableHttpParams(
    url="http://localhost:9000/sse",
    headers={}
)
mcp_server = MCPServerStreamableHttp(params=mcp_params, cache_tools_list=True)
agent = Agent(
    name="Todo Assistant",
    instructions=get_agent_instructions(),
    model=get_model(),
    mcp_servers=[mcp_server]
)
```

The agent automatically discovers and uses MCP tools during execution. No manual tool registration needed.

**Important**: The local MCP server package is named `task_mcp` (not `mcp`) to avoid collision with the official `mcp` Python package.

## Package Structure

```
backend/src/task_mcp/
├── __init__.py          # Exports get_mcp_server, mcp_instance
├── server.py            # FastMCP instance with tool registration
└── tools/
    ├── __init__.py
    ├── add_task.py
    ├── list_tasks.py
    ├── complete_task.py
    ├── delete_task.py
    └── update_task.py
```

**Why `task_mcp`?** We renamed from `mcp` to avoid shadowing the official `mcp` Python package, ensuring proper imports of `mcp.server.fastmcp.FastMCP`.

## Troubleshooting

### MCP Connection Errors

If you see:
- "MCP connection error" in logs
- Agent responses: "I'm having trouble connecting to the task service"

Check:
1. MCP server is running (`ps aux | grep run_mcp_server.py`)
2. Port 9000 is not in use by another process
3. URL in `ChatService.run_agent()` matches MCP server URL
4. MCP server started with `transport="streamable-http"`

### Tool Not Found Errors

If agent says it can't find tools:
1. Verify MCP server has loaded all tools:
   - Check MCP server startup logs for tool registration
2. Ensure `mcp.add_tool()` calls exist in `src/mcp/__init__.py`
3. Verify no import errors in tool modules

### Database Errors

If tasks aren't being saved:
1. Check environment variables: `DATABASE_URL`, `BETTER_AUTH_SECRET`
2. Verify Neon DB connection is active
3. Check database migrations for `tasks` table
4. Inspect TaskService methods for proper SQLModel usage

## Stopping the Services

1. Stop MCP server: `Ctrl+C` in its terminal
2. Stop FastAPI: `Ctrl+C` in its terminal

Both must be restarted together for changes to take effect.

## Production Deployment

For production, consider:
- Running MCP server as a systemd service or Docker container
- Using environment variables for configuration
- Adding authentication between agent and MCP server if needed
- Setting up process managers (supervisor, pm2) for auto-restart
- Monitoring with logs aggregation (ELK, Grafana Loki)
- Using separate ports/hosts for scalability
