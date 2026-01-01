"""
Unit tests for the Task entity.
"""

import pytest
from datetime import datetime
from src.models.task import Task, TaskStatus, TaskPriority


class TestTask:
    """
    Unit tests for the Task entity.
    """

    def test_task_creation_with_required_fields(self):
        """Test creating a task with required fields only."""
        task_id = 1
        title = "Test Task"

        task = Task(task_id, title)

        assert task.id == task_id
        assert task.title == title
        assert task.description == ""
        assert task.status == TaskStatus.PENDING
        assert task.priority == TaskPriority.MEDIUM
        assert task.created_at is not None
        assert task.updated_at is not None

    def test_task_creation_with_all_fields(self):
        """Test creating a task with all fields specified."""
        task_id = 1
        title = "Test Task"
        description = "Test Description"
        status = TaskStatus.IN_PROGRESS
        priority = TaskPriority.HIGH
        created_at = datetime(2023, 1, 1, 12, 0, 0)
        updated_at = datetime(2023, 1, 1, 12, 0, 0)

        task = Task(
            id=task_id,
            title=title,
            description=description,
            status=status,
            priority=priority,
            created_at=created_at,
            updated_at=updated_at
        )

        assert task.id == task_id
        assert task.title == title
        assert task.description == description
        assert task.status == status
        assert task.priority == priority
        assert task.created_at == created_at
        assert task.updated_at == updated_at

    def test_update_timestamp(self):
        """Test updating the task's timestamp."""
        task = Task(1, "Test Task")
        original_updated_at = task.updated_at

        # Wait a moment to ensure time difference
        import time
        time.sleep(0.001)  # Sleep for 1ms to ensure time difference

        task.update_timestamp()

        # The updated_at should be different and later than original
        assert task.updated_at > original_updated_at

    def test_to_dict(self):
        """Test converting task to dictionary."""
        task = Task(1, "Test Task", "Test Description")
        task_dict = task.to_dict()

        expected_dict = {
            "id": 1,
            "title": "Test Task",
            "description": "Test Description",
            "status": "pending",
            "priority": "medium",
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat()
        }

        assert task_dict == expected_dict

    def test_from_dict(self):
        """Test creating a task from dictionary."""
        task_data = {
            "id": 1,
            "title": "Test Task",
            "description": "Test Description",
            "status": "in_progress",
            "priority": "high",
            "created_at": "2023-01-01T12:00:00",
            "updated_at": "2023-01-01T12:00:00"
        }

        task = Task.from_dict(task_data)

        assert task.id == 1
        assert task.title == "Test Task"
        assert task.description == "Test Description"
        assert task.status == TaskStatus.IN_PROGRESS
        assert task.priority == TaskPriority.HIGH
        assert task.created_at == datetime.fromisoformat("2023-01-01T12:00:00")
        assert task.updated_at == datetime.fromisoformat("2023-01-01T12:00:00")

    def test_str_representation(self):
        """Test string representation of the task."""
        # Test pending task
        pending_task = Task(1, "Test Task", status=TaskStatus.PENDING, priority=TaskPriority.MEDIUM)
        expected_pending = "⏳ [1] Test Task (🔸 MEDIUM) - Pending"
        assert str(pending_task) == expected_pending

        # Test in-progress task
        in_progress_task = Task(2, "In Progress Task", status=TaskStatus.IN_PROGRESS, priority=TaskPriority.HIGH)
        expected_in_progress = "🔄 [2] In Progress Task (🔺 HIGH) - In Progress"
        assert str(in_progress_task) == expected_in_progress

        # Test completed task
        completed_task = Task(3, "Completed Task", status=TaskStatus.COMPLETED, priority=TaskPriority.LOW)
        expected_completed = "✅ [3] Completed Task (🔽 LOW) - Completed"
        assert str(completed_task) == expected_completed