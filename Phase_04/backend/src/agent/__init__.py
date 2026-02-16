"""
AI Agent module for Todo Chatbot.

This module provides the AI agent configuration, instructions, and tools
for managing tasks through natural language conversation.
"""
from .config import get_openrouter_client, get_model, get_run_config
from .instructions import get_agent_instructions, AGENT_INSTRUCTIONS
# from .tools import add_task, list_tasks, complete_task, delete_task, update_task

__all__ = [
    "get_openrouter_client",
    "get_model",
    "get_run_config",
    "get_agent_instructions",
    "AGENT_INSTRUCTIONS",
    "add_task",
    "list_tasks",
    "complete_task",
    "delete_task",
    "update_task",
]
