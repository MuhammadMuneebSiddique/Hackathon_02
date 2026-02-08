"""
ChatService for AI Chatbot.

Handles running the AI agent with context and MCP tools.
"""
import logging
from typing import List, Optional
from sqlmodel import Session

from ..agent.config import get_model, get_run_config
from ..agent.instructions import get_agent_instructions
from ..models.message import Message

logger = logging.getLogger(__name__)


class ChatService:
    """Service class for chat operations with AI agent."""

    @staticmethod
    async def run_agent(
        db: Session,
        user_id: str,
        user_message: str,
        context_messages: List[Message]
    ) -> str:
        """
        Run the AI agent with the user message and context.

        This method:
        1. Builds the conversation context from previous messages
        2. Creates an agent with MCP task management tools
        3. Runs the agent to process the user's message
        4. Returns the agent's response

        Args:
            db: Database session
            user_id: The authenticated user's ID
            user_message: The new message from the user
            context_messages: Previous messages for context (sliding window)

        Returns:
            The agent's response text
        """
        mcp_server = None
        try:
            from agents import Agent, Runner
            from agents.mcp import MCPServerStreamableHttp, MCPServerStreamableHttpParams

            # Build conversation history for context
            conversation_history = []
            for msg in context_messages:
                if msg.role.value == "user":
                    conversation_history.append({"role": "user", "content": msg.content})
                else:
                    conversation_history.append({"role": "assistant", "content": msg.content})

            # Store user_id in a way tools can access it
            # We'll pass it via the message context
            context_with_user = f"[User ID: {user_id}]\n\n{user_message}"

            # Configure MCP server connection
            # The MCP server exposes all task management tools at /mcp endpoint
            # SSE (Server-Sent Events) requires Accept: text/event-stream header
            mcp_params = MCPServerStreamableHttpParams(
                url="http://localhost:9000/mcp",
                headers={
                    "Accept": "text/event-stream",
                    "Content-Type": "application/json"
                }
            )
            mcp_server = MCPServerStreamableHttp(params=mcp_params, cache_tools_list=True)

            # Create agent with MCP tools
            agent = Agent(
                name="Todo Assistant",
                instructions=get_agent_instructions(),
                model=get_model(),
                mcp_servers=[mcp_server]
                # note: tools are loaded from MCP server automatically
            )

            # Build input messages
            input_messages = conversation_history + [{"role": "user", "content": context_with_user}]

            # Connect to MCP server and run the agent
            # MCPServerStreamableHttp is a client that connects to remote MCP server
            async with mcp_server:
                config = get_run_config()
                result = await Runner.run(
                    agent,
                    input=input_messages,
                    run_config=config
                )

                # Extract the final response
                if result and result.final_output:
                    return result.final_output
                else:
                    return "I processed your request but didn't generate a response. Please try again."

        except Exception as e:
            # Log the full error for debugging
            logger.error(f"Error in ChatService.run_agent for user {user_id}: {str(e)}", exc_info=True)

            # Classify error for appropriate user-friendly message
            error_msg = str(e).lower()

            # Database errors
            if any(db_err in error_msg for db_err in ["database", "connection", "sql", " OperationalError", "ProgrammingError", "integrity"]):
                user_message = "I'm having trouble accessing your data right now. Please try again in a moment."
            # AI/OpenAI errors
            elif any(ai_err in error_msg for ai_err in ["openai", "api", "rate limit", "quota", "timeout", "service unavailable", "503", "429"]):
                user_message = "The AI service is temporarily unavailable. Please wait a moment and try again."
            # Authentication/Authorization errors
            elif any(auth_err in error_msg for auth_err in ["unauthorized", "forbidden", "authentication", "token"]):
                user_message = "I'm having trouble with authentication. Please log in again."
            # Task validation errors (from MCP tools) - these are user errors, not system errors
            elif any(task_err in error_msg for task_err in ["not found", "multiple tasks match", "ambiguous"]):
                # Pass through the actual error message to help the user understand what went wrong
                user_message = f"I couldn't complete that action: {str(e)[:200]}"
            # MCP connection errors
            elif any(mcp_err in error_msg for mcp_err in ["mcp", "connection", "server", "streamable"]):
                user_message = "I'm having trouble connecting to the task service. Please try again in a moment."
            # Generic errors
            else:
                user_message = "I encountered an unexpected issue. Please try rephrasing your request or try again later."

            return user_message

        finally:
            # Ensure MCP server cleanup
            if mcp_server:
                try:
                    await mcp_server.cleanup()
                except Exception as cleanup_error:
                    logger.warning(f"Failed to cleanup MCP server: {cleanup_error}")

    @staticmethod
    def build_context_string(context_messages: List[Message]) -> str:
        """
        Build a context string from previous messages.

        Args:
            context_messages: List of previous messages

        Returns:
            Formatted context string
        """
        if not context_messages:
            return ""

        context_parts = []
        for msg in context_messages:
            role = "User" if msg.role.value == "user" else "Assistant"
            context_parts.append(f"{role}: {msg.content}")

        return "\n".join(context_parts)


__all__ = ["ChatService"]
