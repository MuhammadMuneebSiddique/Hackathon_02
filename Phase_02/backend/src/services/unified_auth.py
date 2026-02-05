"""
Unified authentication service that supports both legacy JWT and Better Auth tokens
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlmodel import Session, select
from typing import Optional
import os
import datetime
import uuid

from src.models.user import User
from src.database.database import get_session
from src.schemas.user import TokenData

# JWT settings - aligned with Better Auth expectations
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET", "your-default-secret-key-change-this-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours

# Mock session store for single session enforcement
# In production, use Redis or database
active_sessions = {}

class UnifiedAuthService:
    @staticmethod
    def create_unified_token(user_data: dict, expires_delta: Optional[datetime.timedelta] = None):
        """
        Create a token that's compatible with both legacy and Better Auth formats
        """
        to_encode = user_data.copy()

        if expires_delta:
            expire = datetime.datetime.utcnow() + expires_delta
        else:
            expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        # Add standard JWT claims
        to_encode.update({
            "exp": expire.timestamp(),
            "iat": datetime.datetime.utcnow().timestamp(),
            "jti": str(uuid.uuid4())  # JWT ID for tracking
        })

        # Add Better Auth compatible fields
        email = user_data.get("email") or user_data.get("sub")
        user_id = user_data.get("user_id") or user_data.get("sub")

        if email:
            to_encode["email"] = email
        if user_id:
            to_encode["user_id"] = user_id
            to_encode["sub"] = user_id  # Subject (user identifier)

        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

        # Store session for single session enforcement
        if user_id:
            # Remove any existing sessions for this user
            UnifiedAuthService.remove_user_sessions(str(user_id))
            # Store the new session
            active_sessions[f"{user_id}:{to_encode['jti']}"] = encoded_jwt

        return encoded_jwt

    @staticmethod
    def remove_user_sessions(user_id: str):
        """Remove all sessions for a user (single session enforcement)"""
        keys_to_remove = [key for key in active_sessions.keys() if key.startswith(f"{user_id}:")]
        for key in keys_to_remove:
            active_sessions.pop(key, None)

    @staticmethod
    def is_token_valid(user_id: str, token_jti: str) -> bool:
        """Check if a token is still valid"""
        return f"{user_id}:{token_jti}" in active_sessions

def verify_unified_token(credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
    """
    Verify tokens from both legacy system and Better Auth
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # Try to extract user info from various possible fields
        email = payload.get("email")
        user_id = payload.get("user_id") or payload.get("sub") or payload.get("userId")
        token_jti = payload.get("jti")

        # Check if token is expired
        exp_timestamp = payload.get("exp")
        if exp_timestamp:
            if datetime.datetime.utcfromtimestamp(exp_timestamp) < datetime.datetime.utcnow():
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has expired",
                    headers={"WWW-Authenticate": "Bearer"},
                )

        if not user_id and not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check session validity if jti is present (for single session enforcement)
        if token_jti and user_id:
            if not UnifiedAuthService.is_token_valid(user_id, token_jti):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Session has been invalidated (single session enforcement)",
                    headers={"WWW-Authenticate": "Bearer"},
                )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return token

async def get_current_user_from_unified_auth(
    token: str = Depends(verify_unified_token),
    db: Session = Depends(get_session)
) -> User:
    """
    Get current user from unified authentication system
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        email = payload.get("email")
        user_id = payload.get("user_id") or payload.get("sub") or payload.get("userId")
        token_jti = payload.get("jti")

        # Check if token is expired
        exp_timestamp = payload.get("exp")
        if exp_timestamp:
            if datetime.datetime.utcfromtimestamp(exp_timestamp) < datetime.datetime.utcnow():
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has expired",
                    headers={"WWW-Authenticate": "Bearer"},
                )

        # Check session validity if jti is present
        if token_jti and user_id:
            if not UnifiedAuthService.is_token_valid(user_id, token_jti):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Session has been invalidated (single session enforcement)",
                    headers={"WWW-Authenticate": "Bearer"},
                )

        # Find user by ID or email
        user = None
        if user_id:
            statement = select(User).where(User.id == user_id)
            user = db.exec(statement).first()

        if not user and email:
            statement = select(User).where(User.email == email)
            user = db.exec(statement).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )