"""
Basic tests for the TODO application backend
"""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_main():
    """Test the main endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
    assert response.json()["message"] == "Multi-User Web TODO Application API"

def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_auth_routes_exist():
    """Test that auth routes are registered"""
    # Test that we get proper error for missing credentials rather than 404
    response = client.post("/api/v1/auth/login")
    # Should not be a 404 - route should exist
    assert response.status_code != 404

def test_tasks_routes_exist():
    """Test that tasks routes are registered"""
    # Test that we get proper error for missing auth rather than 404
    response = client.get("/api/v1/tasks")
    # Should not be a 404 - route should exist
    assert response.status_code != 404