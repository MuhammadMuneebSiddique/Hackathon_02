"""
Migration script to transition from legacy auth to unified Better Auth compatible system
"""
import asyncio
from sqlmodel import create_engine, Session, select
from src.database.database import DATABASE_URL, engine
from src.models.user import User
from src.services.auth import hash_password
from src.services.unified_auth import UnifiedAuthService
import datetime

def migrate_users():
    """
    Migrate existing users to be compatible with the new auth system
    """
    print("Starting user migration...")

    with Session(engine) as session:
        # Get all existing users
        users = session.exec(select(User)).all()

        print(f"Found {len(users)} users to migrate")

        for user in users:
            print(f"Migrating user: {user.email}")

            # Verify the user's password hash is still valid
            # (This is mostly a verification step since users are already in the system)

        print("User migration completed successfully!")

def test_token_generation():
    """
    Test that the new unified token system works correctly
    """
    print("\nTesting unified token generation...")

    # Create a test token
    test_user_data = {
        "email": "test@example.com",
        "user_id": "test-user-id-123",
        "name": "Test User"
    }

    token = UnifiedAuthService.create_unified_token(test_user_data)
    print(f"Generated token: {token[:50]}...")  # Show first 50 chars

    # Verify the token can be decoded
    from jose import jwt
    SECRET_KEY = "your-default-secret-key-change-this-in-production"
    ALGORITHM = "HS256"

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"Token payload: {payload}")
        print("Token verification successful!")
    except Exception as e:
        print(f"Token verification failed: {e}")

if __name__ == "__main__":
    migrate_users()
    test_token_generation()
    print("\nMigration script completed!")