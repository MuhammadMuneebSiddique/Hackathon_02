from pydantic import BaseModel
from typing import Optional

class UserLogin(BaseModel):
    """
    Schema for user login credentials.
    """
    email: str
    password: str

class Token(BaseModel):
    """
    Schema for authentication token response.
    """
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """
    Schema for token data.
    """
    email: Optional[str] = None
    user_id: Optional[str] = None