"""
AI Agent configuration for OpenRouter integration.

This module configures the OpenAI Agents SDK to use OpenRouter
for LLM access with the model specified via environment variable.
"""
import os
from agents import AsyncOpenAI, OpenAIChatCompletionsModel
from agents.run import RunConfig
from dotenv import load_dotenv

load_dotenv()


def get_openrouter_client() -> AsyncOpenAI:
    """
    Create and return an OpenRouter client using AsyncOpenAI.

    OpenRouter provides access to multiple LLM providers through a single API.
    """
    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key: 
        raise ValueError(
            "OPENROUTER_API_KEY environment variable is not set. "
            "Please add it to your .env file."
        )

    client = AsyncOpenAI(
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1",
    )

    return client


def get_model() -> OpenAIChatCompletionsModel:
    """
    Create and return the model instance for the agent.

    The model name is read from OPENROUTER_MODEL environment variable.
    """
    client = get_openrouter_client()
    model_name = os.getenv("OPENROUTER_MODEL", "openai/gpt-oss-20b:free")

    model = OpenAIChatCompletionsModel(
        openai_client=client,
        model=model_name,
    )

    return model


def get_run_config() -> RunConfig:
    """
    Create and return the RunConfig for agent execution.

    This configuration is passed to Runner.run() for non-OpenAI providers.
    """
    client = get_openrouter_client()
    model = get_model()

    config = RunConfig(
        model=model,
        model_provider=client,
        tracing_disabled=True  # Disable tracing when not using OpenAI directly
    )

    return config


# Export commonly used items
__all__ = [
    "get_openrouter_client",
    "get_model",
    "get_run_config",
]
