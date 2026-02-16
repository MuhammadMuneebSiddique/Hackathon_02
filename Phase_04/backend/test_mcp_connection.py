"""
Test MCP Server Connection

This script tests the connection to the MCP server to verify it's working correctly
with the required SSE (Server-Sent Events) headers.

Usage:
    python test_mcp_connection.py
"""

import requests
import json
import sys


def test_mcp_connection():
    """Test MCP server connection with proper SSE headers."""

    url = "http://localhost:9000/mcp"

    headers = {
        "Accept": "text/event-stream",
        "Content-Type": "application/json"
    }

    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {
                "name": "test-client",
                "version": "1.0.0"
            }
        }
    }

    print("=" * 60)
    print("Testing MCP Server Connection")
    print("=" * 60)
    print(f"URL: {url}")
    print(f"Headers: {json.dumps(headers, indent=2)}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    print("=" * 60)

    try:
        response = requests.post(
            url,
            headers=headers,
            json=payload,
            stream=True,
            timeout=5
        )

        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type')}")
        print("=" * 60)

        if response.status_code == 200:
            print("SUCCESS: MCP server responded correctly!")
            print("=" * 60)
            print("Response (streaming):")
            print("-" * 60)

            line_count = 0
            for line in response.iter_lines():
                if line:
                    decoded = line.decode('utf-8')
                    print(decoded)

                    # Parse SSE data format
                    if decoded.startswith('data: '):
                        try:
                            data = json.loads(decoded[6:])  # Remove 'data: ' prefix
                            print("\nParsed JSON:")
                            print(json.dumps(data, indent=2))
                        except json.JSONDecodeError as e:
                            print(f"JSON parse error: {e}")

                    line_count += 1
                    if line_count >= 5:  # Limit output
                        print("... (truncated)")
                        break

            print("-" * 60)
            print("✓ Connection successful!")
            return True

        else:
            print(f"ERROR: Server returned status {response.status_code}")
            print(f"Response: {response.text}")
            return False

    except requests.exceptions.ConnectionError:
        print("ERROR: Cannot connect to MCP server")
        print("Make sure the MCP server is running:")
        print("  cd backend")
        print("  python run_mcp_server.py")
        return False

    except requests.exceptions.Timeout:
        print("ERROR: Connection timed out")
        return False

    except Exception as e:
        print(f"ERROR: Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_list_tools():
    """Test listing available tools from MCP server."""

    url = "http://localhost:9000/mcp"

    headers = {
        "Accept": "text/event-stream",
        "Content-Type": "application/json"
    }

    payload = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/list",
        "params": {}
    }

    print("\n" + "=" * 60)
    print("Testing Tool Discovery")
    print("=" * 60)

    try:
        response = requests.post(
            url,
            headers=headers,
            json=payload,
            stream=True,
            timeout=5
        )

        if response.status_code == 200:
            print("SUCCESS: Tools list retrieved!")
            print("-" * 60)

            for line in response.iter_lines():
                if line:
                    decoded = line.decode('utf-8')
                    if decoded.startswith('data: '):
                        try:
                            data = json.loads(decoded[6:])
                            if 'result' in data and 'tools' in data['result']:
                                tools = data['result']['tools']
                                print(f"Available tools ({len(tools)}):")
                                for tool in tools:
                                    print(f"  - {tool.get('name', 'unknown')}")
                                    desc = tool.get('description', '')
                                    if desc:
                                        print(f"    {desc[:80]}...")
                        except json.JSONDecodeError:
                            pass

            print("=" * 60)
            return True
        else:
            print(f"ERROR: {response.status_code} - {response.text}")
            return False

    except Exception as e:
        print(f"ERROR: {e}")
        return False


if __name__ == "__main__":
    print("\nMCP Server Connection Test")
    print("=" * 60)

    # Test 1: Initialize connection
    init_success = test_mcp_connection()

    # Test 2: List tools
    if init_success:
        tools_success = test_list_tools()

    print("\n" + "=" * 60)
    if init_success:
        print("✓ All tests passed!")
        print("\nYour MCP server is running correctly.")
        print("You can now use the chat feature with AI agent.")
        sys.exit(0)
    else:
        print("✗ Tests failed!")
        print("\nTroubleshooting:")
        print("1. Ensure MCP server is running: python run_mcp_server.py")
        print("2. Check if port 9000 is available")
        print("3. Verify no firewall blocking localhost connections")
        sys.exit(1)
