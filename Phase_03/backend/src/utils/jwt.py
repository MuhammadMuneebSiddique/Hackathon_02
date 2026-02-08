from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlmodel import Session, select
from typing import Optional
import os

from src.models.user import User
from src.database.database import get_session
from src.schemas.user import TokenData
from src.services.auth import is_token_valid

# JWT settings
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET", "your-default-secret-key-change-this-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

security = HTTPBearer()

def verify_access_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[str]:
    """
    Verify the access token and return the token if valid.
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: str = payload.get("user_id")
        token_jti: str = payload.get("jti")  # JWT ID for session tracking

        if email is None or user_id is None or token_jti is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check if the token is still valid (not invalidated by single session enforcement)
        if not is_token_valid(user_id, token_jti):
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

async def get_current_user(token: str = Depends(verify_access_token), db: Session = Depends(get_session)) -> User:
    """
    Get the current user from the token.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: str = payload.get("user_id")
        token_jti: str = payload.get("jti")  # JWT ID for session tracking

        if email is None or user_id is None or token_jti is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check if the token is still valid (not invalidated by single session enforcement)
        if not is_token_valid(user_id, token_jti):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session has been invalidated (single session enforcement)",
                headers={"WWW-Authenticate": "Bearer"},
            )

        statement = select(User).where(User.id == user_id)
        user = db.exec(statement).first()

        if user is None:
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