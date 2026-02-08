"""
ConversationService for AI Chatbot.

Handles conversation persistence, message storage, and context management
with sliding window for token budget control.
"""
from datetime import datetime
from typing import List, Optional
from sqlmodel import Session, select
from ..models.conversation import Conversation
from ..models.message import Message, MessageRole


# Token budget for context window (roughly 4000 tokens)
MAX_CONTEXT_TOKENS = 4000
# Approximate characters per token
CHARS_PER_TOKEN = 4


class ConversationService:
    """Service class for conversation and message operations."""

    @staticmethod
    def get_or_create_conversation(db: Session, user_id: str) -> Conversation:
        """
        Get existing conversation for user or create new one.
        Each user has exactly one conversation.
        """
        conversation = db.exec(
            select(Conversation).where(Conversation.user_id == user_id)
        ).first()

        if not conversation:
            conversation = Conversation(user_id=user_id)
            db.add(conversation)
            db.commit()
            db.refresh(conversation)

        return conversation

    @staticmethod
    def get_messages(
        db: Session,
        conversation_id: int,
        limit: int = 50
    ) -> List[Message]:
        """
        Get all messages for a conversation, ordered by creation time.
        """
        messages = db.exec(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at)
            .limit(limit)
        ).all()

        return list(messages)

    @staticmethod
    def add_message(
        db: Session,
        conversation_id: int,
        role: MessageRole,
        content: str
    ) -> Message:
        """
        Add a new message to the conversation.
        Also updates the conversation's updated_at timestamp.
        """
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content
        )
        db.add(message)

        # Update conversation timestamp
        conversation = db.get(Conversation, conversation_id)
        if conversation:
            conversation.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(message)

        return message

    @staticmethod
    def get_context_messages(
        db: Session,
        conversation_id: int,
        max_tokens: int = MAX_CONTEXT_TOKENS
    ) -> List[Message]:
        """
        Get recent messages within token budget (sliding window).

        This implements the sliding window context management to prevent
        context overflow while maintaining recent conversation relevance.
        """
        # Fetch recent messages (hard limit as safety)
        all_messages = db.exec(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .limit(50)
        ).all()

        # Calculate tokens and build context within budget
        total_tokens = 0
        context_messages = []

        for message in all_messages:
            # Estimate tokens for this message
            msg_tokens = len(message.content) // CHARS_PER_TOKEN

            if total_tokens + msg_tokens > max_tokens:
                # Budget exceeded, stop adding messages
                break

            # Add message to context (insert at beginning to maintain order)
            context_messages.insert(0, message)
            total_tokens += msg_tokens

        return context_messages

    @staticmethod
    def estimate_tokens(text: str) -> int:
        """
        Estimate token count for text.

        Uses rough approximation: 1 token ≈ 4 characters.
        """
        return len(text) // CHARS_PER_TOKEN
