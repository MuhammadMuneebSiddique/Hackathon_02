"""
MCP (Model Context Protocol) package for AI Chatbot.

This package provides the MCP server that exposes task management tools
via streamable HTTP transport. The server is defined in server.py.

Usage:
    from src.task_mcp.server import get_mcp_server
    mcp = get_mcp_server()
    mcp.run(transport="streamable-http", mount_path="/mcp")
"""

# Re-export the canonical mcp instance and getter from server module
# This avoids circular imports while making tools easily accessible
from .server import get_mcp_server, mcp as mcp_instance

__all__ = ["get_mcp_server", "mcp_instance"]
