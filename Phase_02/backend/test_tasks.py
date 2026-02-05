import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from main import app
from src.database.database import get_session
from src.models.user import User
from src.models.task import Task
from src.services.auth import hash_password


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


def create_test_user_and_get_token(client, session):
    """Helper function to create a test user and get their auth token"""
    # Register a user
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "taskuser@example.com", "password": "password123"}
    )
    assert response.status_code == 200

    # Login to get token
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "taskuser@example.com", "password": "password123"}
    )
    assert response.status_code == 200

    token = response.json()["access_token"]
    return token


def test_create_task(client, session):
    """Test creating a new task"""
    token = create_test_user_and_get_token(client, session)

    response = client.post(
        "/api/v1/tasks",
        json={
            "title": "Test Task",
            "description": "This is a test task",
            "is_completed": False
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["description"] == "This is a test task"
    assert data["is_completed"] is False


def test_get_tasks(client, session):
    """Test getting all tasks for a user"""
    token = create_test_user_and_get_token(client, session)

    # Create a task first
    client.post(
        "/api/v1/tasks",
        json={
            "title": "Test Task",
            "description": "This is a test task",
            "is_completed": False
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    # Get tasks
    response = client.get("/api/v1/tasks", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) == 1
    assert tasks[0]["title"] == "Test Task"


def test_get_specific_task(client, session):
    """Test getting a specific task"""
    token = create_test_user_and_get_token(client, session)

    # Create a task
    create_response = client.post(
        "/api/v1/tasks",
        json={
            "title": "Specific Task",
            "description": "This is a specific task",
            "is_completed": False
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    task_id = create_response.json()["id"]

    # Get the specific task
    response = client.get(f"/api/v1/tasks/{task_id}", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    task = response.json()
    assert task["title"] == "Specific Task"


def test_update_task(client, session):
    """Test updating a task"""
    token = create_test_user_and_get_token(client, session)

    # Create a task
    create_response = client.post(
        "/api/v1/tasks",
        json={
            "title": "Original Task",
            "description": "Original description",
            "is_completed": False
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    task_id = create_response.json()["id"]

    # Update the task
    response = client.put(
        f"/api/v1/tasks/{task_id}",
        json={
            "title": "Updated Task",
            "description": "Updated description"
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    updated_task = response.json()
    assert updated_task["title"] == "Updated Task"
    assert updated_task["description"] == "Updated description"


def test_toggle_task_completion(client, session):
    """Test toggling task completion status"""
    token = create_test_user_and_get_token(client, session)

    # Create a task
    create_response = client.post(
        "/api/v1/tasks",
        json={
            "title": "Toggle Task",
            "description": "Task to toggle",
            "is_completed": False
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    task_id = create_response.json()["id"]

    # Toggle completion
    response = client.patch(
        f"/api/v1/tasks/{task_id}/toggle",
        json={"is_completed": True},
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    toggled_task = response.json()
    assert toggled_task["is_completed"] is True


def test_delete_task(client, session):
    """Test deleting a task"""
    token = create_test_user_and_get_token(client, session)

    # Create a task
    create_response = client.post(
        "/api/v1/tasks",
        json={
            "title": "Task to Delete",
            "description": "This task will be deleted",
            "is_completed": False
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    task_id = create_response.json()["id"]

    # Delete the task
    response = client.delete(f"/api/v1/tasks/{task_id}", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200

    # Verify task is gone
    get_response = client.get(f"/api/v1/tasks/{task_id}", headers={"Authorization": f"Bearer {token}"})
    assert get_response.status_code == 404


def test_unauthorized_access_to_other_users_task(client, session):
    """Test that a user cannot access another user's task"""
    # Create first user and task
    first_user_token = create_test_user_and_get_token(client, session)

    create_response = client.post(
        "/api/v1/tasks",
        json={
            "title": "Private Task",
            "description": "This is a private task",
            "is_completed": False
        },
        headers={"Authorization": f"Bearer {first_user_token}"}
    )

    task_id = create_response.json()["id"]

    # Create second user
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "seconduser@example.com", "password": "password123"}
    )
    assert response.status_code == 200

    # Login second user
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "seconduser@example.com", "password": "password123"}
    )
    second_user_token = response.json()["access_token"]

    # Try to access first user's task with second user's token
    response = client.get(f"/api/v1/tasks/{task_id}", headers={"Authorization": f"Bearer {second_user_token}"})

    # Should not be allowed (404 since task exists but belongs to another user)
    assert response.status_code == 404