"""
MCP Server for AI Chatbot.
"""
from fastapi import FastAPI
from mcp.server.fastmcp import FastMCP

# Create MCP instance
mcp = FastMCP(name="Todo Task MCP Server")

# Import tools AFTER creating mcp so decorators register properly
from .tools import (
    add_task,
    list_tasks,
    complete_task,
    delete_task,
    update_task,
)

# Create FastAPI app (THIS is what Uvicorn will run)
app = FastAPI(title="Todo MCP Server")

# Mount MCP as ASGI app
app.mount("/mcp", mcp.streamable_http_app())


def get_mcp_server() -> FastMCP:
    return mcp


# Keep this only for local non-uvicorn runs (optional)
if __name__ == "__main__":
    mcp.run(transport="streamable-http", mount_path="/mcp")
