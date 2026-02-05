import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from datetime import timedelta
from jose import jwt
import os

from main import app
from src.database.database import get_session
from src.models.user import User
from src.services.auth import hash_password, create_access_token
from src.utils.jwt import SECRET_KEY, ALGORITHM


# Create test database
@pytest.fixture(name="engine")
def fixture_engine():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(bind=engine)
    return engine


@pytest.fixture(name="session")
def fixture_session(engine):
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def fixture_client(session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


def test_register_user(client):
    """Test user registration endpoint"""
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "test@example.com", "password": "testpassword123"}
    )
    assert response.status_code == 200

    data = response.json()
    assert "id" in data
    assert data["email"] == "test@example.com"


def test_register_duplicate_email(client):
    """Test registering with duplicate email"""
    # Register first user
    client.post(
        "/api/v1/auth/register",
        json={"email": "duplicate@example.com", "password": "password123"}
    )

    # Try to register with same email
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "duplicate@example.com", "password": "password123"}
    )
    assert response.status_code == 400


def test_login_success(client):
    """Test successful login"""
    # Register a user first
    client.post(
        "/api/v1/auth/register",
        json={"email": "login@example.com", "password": "password123"}
    )

    # Login
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "password123"}
    )
    assert response.status_code == 200

    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials(client):
    """Test login with invalid credentials"""
    # Register a user first
    client.post(
        "/api/v1/auth/register",
        json={"email": "invalid@example.com", "password": "password123"}
    )

    # Try to login with wrong password
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "invalid@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401


def test_logout(client):
    """Test logout functionality"""
    # Register and login to get token
    client.post(
        "/api/v1/auth/register",
        json={"email": "logout@example.com", "password": "password123"}
    )

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "logout@example.com", "password": "password123"}
    )

    token = login_response.json()["access_token"]

    # Logout
    response = client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200