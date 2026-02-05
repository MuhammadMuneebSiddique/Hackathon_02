from sqlmodel import Session, select
from src.models.user import User
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import os, hashlib, base64
import redis  # For session management

# Password hashing context
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET", "your-default-secret-key-change-this-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours

# Redis connection for session management (optional - in-memory alternative used if Redis not available)
try:
    import redis
    redis_client = redis.Redis(
        host="localhost",
        port=6379,
        db=0,
        decode_responses=True
    )
    redis_client.ping()
    REDIS_ENABLED = True
except Exception:
    redis_client = None
    REDIS_ENABLED = False

# In-memory session storage as fallback when Redis is not available
active_sessions = {}

def _prehash(password: str) -> str:
    """
    Pre-hash password safely for bcrypt (Python 3.13 compatible)
    """
    digest = hashlib.sha256(password.encode("utf-8")).digest()
    return base64.b64encode(digest).decode("utf-8")  # 44 chars


def hash_password(password: str) -> str:
    prehashed = _prehash(password)
    return pwd_context.hash(prehashed)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    prehashed = _prehash(plain_password)
    return pwd_context.verify(prehashed, hashed_password)

    return pwd_context.hash(sha256_password)

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user by email and password.
    """
    statement = select(User).where(User.email == email)
    user = db.exec(statement).first()

    if not user or not verify_password(password, user.password):
        return None

    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Create a JWT access token with single session enforcement.
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)  # Default expiration

    to_encode.update({"exp": expire})

    # Generate a unique token ID to track sessions
    import uuid
    token_jti = str(uuid.uuid4())
    to_encode.update({"jti": token_jti})  # JWT ID for tracking

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    # Store the active session for single session enforcement
    user_id = data.get("user_id")
    if user_id:
        # Remove any existing sessions for this user (single session enforcement)
        remove_user_sessions(user_id)

        # Store the new session
        try:
            # Try to store in Redis if available
            redis_client.setex(f"session:{user_id}:{token_jti}", ACCESS_TOKEN_EXPIRE_MINUTES * 60, encoded_jwt)
        except:
            # Fallback to in-memory storage
            active_sessions[f"{user_id}:{token_jti}"] = encoded_jwt

    return encoded_jwt

def remove_user_sessions(user_id: str):  # Changed from int to str to match user_id type
    if REDIS_ENABLED:
        pattern = f"session:{user_id}:*"
        for key in redis_client.keys(pattern):
            redis_client.delete(key)
    else:
        # Remove from in-memory storage
        keys_to_remove = [key for key in active_sessions.keys() if key.startswith(f"{user_id}:")]
        for key in keys_to_remove:
            active_sessions.pop(key, None)

def invalidate_token(user_id: str, token_jti: str):
    """
    Invalidate a specific token.
    """
    try:
        redis_client.delete(f"session:{user_id}:{token_jti}")
    except:
        active_sessions.pop(f"{user_id}:{token_jti}", None)

def is_token_valid(user_id: str, token_jti: str) -> bool:
    """
    Check if a token is still valid (not invalidated).
    """
    try:
        # Check in Redis
        return redis_client.exists(f"session:{user_id}:{token_jti}") == 1
    except:
        # Check in-memory storage
        return f"{user_id}:{token_jti}" in active_sessions