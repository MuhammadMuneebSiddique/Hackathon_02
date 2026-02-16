"""
Standalone MCP Server Runner

This script starts the MCP (Model Context Protocol) server independently
with streamable HTTP transport. The AI agent connects to this server to
access task management tools.

Usage:
    python run_mcp_server.py

Environment variables:
    MCP_PORT: Port for the MCP server (default: 9000)
    MCP_HOST: Host to bind to (default: 127.0.0.1)

The server will start at http://localhost:9000/mcp
"""

import os
import sys
from pathlib import Path

# Add backend/src to Python path
project_root = Path(__file__).resolve().parent
sys.path.insert(0, str(project_root / "src"))

try:
    import uvicorn
except ImportError:
    print("Error: uvicorn is not installed. Install with: pip install uvicorn[standard]")
    sys.exit(1)

from src.task_mcp.server import get_mcp_server

def main():
    """Start the MCP server with uvicorn."""
    host = os.getenv("MCP_HOST", "127.0.0.1")
    port = int(os.getenv("MCP_PORT", 9000))

    mcp = get_mcp_server()
    # Get the ASGI app for streamable HTTP transport
    app = mcp.streamable_http_app

    print(f"Starting MCP Server...")
    print(f"Transport: streamable-http")
    print(f"URL: http://{host}:{port}/mcp")
    print("Press Ctrl+C to stop\n")

    uvicorn.run(app, host=host, port=port, log_level="info")

if __name__ == "__main__":
    main()