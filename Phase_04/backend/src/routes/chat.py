"""
Chat API routes for AI Chatbot.

Provides endpoints for:
- POST /api/chat: Send a message and receive AI response
- GET /api/chat/history: Get conversation history
"""
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List

from ..database.database import get_session
from ..models.user import User
from ..utils.jwt_auth import validate_user_id_in_url_matches_token
from ..schemas.chat import (
    ChatRequest,
    ChatResponse,
    ChatHistoryResponse,
    MessageResponse,
    ChatErrorResponse
)
from ..services.conversation_service import ConversationService
from ..services.chat_service import ChatService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/{user_id}/chat",
    response_model=ChatResponse,
    responses={
        200: {"description": "Chat response successfully generated"},
        401: {"description": "Unauthorized - Invalid or missing JWT"},
        500: {"model": ChatErrorResponse, "description": "AI service error"}
    }
)
async def send_chat_message(
    user_id: str,
    request: ChatRequest,
    current_user: User = Depends(validate_user_id_in_url_matches_token),
    db: Session = Depends(get_session)
):
    """
    Send a message to the AI assistant and receive a response.

    This endpoint implements the stateless request cycle:
    1. Authenticate user via Better Auth
    2. Load or create conversation
    3. Store user message
    4. Load context (sliding window)
    5. Run agent with MCP tools
    6. Store assistant response
    7. Return response to user

    Args:
        user_id: The authenticated user's ID
        request: Chat message request containing the user's message
        current_user: Authenticated user from JWT
        db: Database session

    Returns:
        ChatResponse with AI response, conversation_id, and message_id
    """
    # Ensure user_id matches authenticated user
    if user_id != current_user.id:
        raise HTTPException(status_code=401, detail="User ID mismatch")

    try:
        # Get or create conversation for user
        conversation = ConversationService.get_or_create_conversation(db, user_id)

        # Store user message
        from ..models.message import MessageRole
        user_message = ConversationService.add_message(
            db, conversation.id, MessageRole.USER, request.message
        )

        # Load context (sliding window)
        context_messages = ConversationService.get_context_messages(db, conversation.id)

        # Run agent with context
        response_content = await ChatService.run_agent(
            db=db,
            user_id=user_id,
            user_message=request.message,
            context_messages=context_messages
        )

        # Store assistant response
        assistant_message = ConversationService.add_message(
            db, conversation.id, MessageRole.ASSISTANT, response_content
        )

        return ChatResponse(
            response=response_content,
            conversation_id=conversation.id,
            message_id=assistant_message.id
        )

    except Exception as e:
        # Log the error with full details for debugging
        logger.error(f"Error in send_chat_message for user {user_id}: {str(e)}", exc_info=True)

        # Determine appropriate friendly error message based on error type
        error_msg = str(e).lower()

        # Database errors (connection, integrity, etc.)
        if any(db_err in error_msg for db_err in ["database", "connection", "sql", "integrity", " OperationalError", "ProgrammingError"]):
            friendly_message = "We're experiencing technical difficulties. Please try again in a few moments."
        # AI/Agent errors (timeouts, API limits, etc.)
        elif any(ai_err in error_msg for ai_err in ["api", "timeout", "rate limit", "quota", "service unavailable"]):
            friendly_message = "The AI assistant is temporarily unavailable. Please try again shortly."
        # Input/validation errors
        elif "validation" in error_msg or "invalid" in error_msg:
            friendly_message = "There was an issue with your request. Please check your input and try again."
        # Default fallback
        else:
            friendly_message = "Something went wrong. Our team has been notified. Please try again."

        raise HTTPException(
            status_code=500,
            detail=friendly_message
        )


@router.get(
    "/{user_id}/chat/history",
    response_model=ChatHistoryResponse,
    responses={
        200: {"description": "Chat history successfully retrieved"},
        401: {"description": "Unauthorized - Invalid or missing JWT"}
    }
)
async def get_chat_history(
    user_id: str,
    current_user: User = Depends(validate_user_id_in_url_matches_token),
    db: Session = Depends(get_session)
):
    """
    Get conversation history for the authenticated user.

    Returns all messages in the user's conversation, ordered by creation time.

    Args:
        user_id: The authenticated user's ID
        current_user: Authenticated user from JWT
        db: Database session

    Returns:
        ChatHistoryResponse with conversation_id and list of messages
    """
    # Ensure user_id matches authenticated user
    if user_id != current_user.id:
        raise HTTPException(status_code=401, detail="User ID mismatch")

    # Get conversation for user
    conversation = ConversationService.get_or_create_conversation(db, user_id)

    # Get all messages
    messages = ConversationService.get_messages(db, conversation.id)

    # Convert to response format
    message_responses = [
        MessageResponse(
            id=msg.id,
            role=msg.role,
            content=msg.content,
            created_at=msg.created_at
        )
        for msg in messages
    ]

    return ChatHistoryResponse(
        conversation_id=conversation.id,
        messages=message_responses
    )
