"""
Migration script to add conversations and messages tables for AI Chatbot.

This script creates the necessary database tables for conversation persistence.
Run this after deploying the code to ensure database schema is up-to-date.

Usage: python migrate_chat.py
"""
import sys
from pathlib import Path

# Add parent directory to path to import from src
sys.path.append(str(Path(__file__).parent))

from src.database.database import create_db_and_tables, engine
from sqlmodel import SQLModel
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main():
    """Create conversations and messages tables."""
    try:
        logger.info("Creating AI Chatbot tables...")

        # Import models to register them with SQLModel metadata
        from src.models.conversation import Conversation
        from src.models.message import Message

        # Create tables
        SQLModel.metadata.create_all(engine, tables=[Conversation.__table__, Message.__table__])

        logger.info("✅ Successfully created conversations and messages tables")
        return True

    except Exception as e:
        logger.error(f"❌ Failed to create tables: {e}")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
