from sqlmodel import create_engine, Session
import os
from typing import Generator
from dotenv import load_dotenv


load_dotenv()

# Database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL")

# Use SQLite as fallback if PostgreSQL URL is not provided
if not DATABASE_URL or "postgresql" not in DATABASE_URL.lower():
    DATABASE_URL = "sqlite:///./todo_app.db"

# Create engine
engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)

def get_session() -> Generator[Session, None, None]:
    """Provide a transactional scope around a series of operations."""
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    """Create database tables"""
    # Import models to register them with SQLModel metadata
    from ..models.user import User  # Import here to avoid circular imports
    from ..models.task import Task  # Import here to avoid circular imports
    from ..models.conversation import Conversation  # AI Chatbot model
    from ..models.message import Message  # AI Chatbot model

    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)

if __name__ == "__main__":
    create_db_and_tables()
    print("TABLE CREATE SUCCESSFULLY")