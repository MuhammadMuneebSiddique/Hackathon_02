from datetime import datetime, timedelta
from typing import Optional
import os
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlmodel import Session
from src.database.database import get_session
from src.models.user import User
import jwt
from jwt import PyJWKClient
from sqlmodel import select

# Security scheme for extracting JWT from Authorization header
security = HTTPBearer()

# JWT configuration
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET", "")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days as per requirement
JWKS_URL = "http://localhost:3000/api/auth/jwks"

# IMPORTANT: these must match your frontend domain
ISSUER = "http://localhost:3000"
AUDIENCE = "http://localhost:3000"

jwk_client = PyJWKClient(JWKS_URL)

# def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
#     """
#     Create a JWT access token with the provided data.
#     """
#     to_encode = data.copy()
#     if expires_delta:
#         expire = datetime.utcnow() + expires_delta
#     else:
#         expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

#     to_encode.update({"exp": expire})
#     encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
#     return encoded_jwt


def verify_jwt_token(token: str):

    if not token or token == "undefined":
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    try:
        signing_key = jwk_client.get_signing_key_from_jwt(token)

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["EdDSA"],
            audience=AUDIENCE,
            issuer=ISSUER,
        )

        user_id = payload.get("id") or payload.get("sub")
        email = payload.get("email")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )

        return {"id": user_id, "email": email}

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")

    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )



async def get_current_user_from_jwt(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_session)
) -> User:
    """
    Dependency to get current user from JWT token in Authorization header.
    """
    token = credentials.credentials

    # Verify the JWT token and extract user information
    user_info = verify_jwt_token(token)
    user_id = user_info["id"]
    email = user_info["email"]


    # Find user by ID in our database
    statement = select(User).where(User.id == user_id)
    user = db.exec(statement).first()

    if not user:
        # Create user in our system if not exists, using the JWT user ID as our user ID
        user = User(
            id=user_id,  # Using JWT user ID (which should be a UUID string)
            email=email or f"temp_{user_id}@example.com",  # Use email from token or create temp
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


async def validate_user_id_in_url_matches_token(
    request: Request,
    current_user: User = Depends(get_current_user_from_jwt)
):
    """
    Validate that the user_id in the URL path matches the user_id in the JWT token.
    This ensures users can only access their own data.
    """
    # Extract user_id from the URL path
    # The URL pattern is /api/{user_id}/tasks or similar
    path_parts = request.url.path.strip('/').split('/')

    # Look for the user_id in the path after 'api'
    # Expected pattern: ['api', '{user_id}', 'tasks', ...] or ['api', '{user_id}', 'tasks', '{task_id}', ...]
    user_id_in_url = None
    if len(path_parts) >= 3 and path_parts[0] == 'api':
        user_id_in_url = path_parts[1]  # The second element after 'api/' should be user_id

    # If we found a user_id in the URL, validate it matches the token
    if user_id_in_url and user_id_in_url != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user ID in URL does not match authenticated user"
        )

    return current_user