"""
MCP Server for AI Chatbot.

This module provides the MCP (Model Context Protocol) server that exposes
task management tools for the AI agent to use. The server runs with
streamable HTTP transport.
"""
from mcp.server.fastmcp import FastMCP

# Create the MCP server instance FIRST before importing tools
# This ensures that when tools import `mcp` from this module, it already exists
mcp = FastMCP(
    name="Todo Task MCP Server"
)

# Import tools to trigger registration via @mcp.tool() decorators
# Tools automatically register themselves with the mcp instance above
from .tools import (
    add_task,
    list_tasks,
    complete_task,
    delete_task,
    update_task,
)

# No manual registration needed - decorators handle it


def get_mcp_server() -> FastMCP:
    """Return the MCP server instance."""
    return mcp


if __name__ == "__main__":
    # Run the server with streamable HTTP transport
    # Default: http://127.0.0.1:8000/mcp
    # Configure via MCP_HOST and MCP_PORT environment variables
    mcp.run(transport="streamable-http", mount_path="/mcp")
