from fastapi import Depends
from src.utils.jwt_auth import get_current_user_from_jwt
from src.models.user import User

# Re-export the JWT-based authentication functions for backward compatibility
async def get_current_user_from_better_auth(
    current_user: User = Depends(get_current_user_from_jwt)
) -> User:
    """
    Get current user from Better Auth JWT token.
    This function maintains the same interface as the old cookie-based approach.
    """
    return current_user