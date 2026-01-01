"""
Unit tests for the TaskManager class.
"""

import pytest
from src.services.task_manager import TaskManager
from src.models.task import Task, TaskStatus, TaskPriority


class TestTaskManager:
    """
    Unit tests for the TaskManager class.
    """

    def setup_method(self):
        """Set up a fresh TaskManager for each test."""
        self.task_manager = TaskManager()

    def test_initial_state(self):
        """Test initial state of TaskManager."""
        assert len(self.task_manager.get_all_tasks()) == 0
        assert self.task_manager._next_id == 1

    def test_create_task_basic(self):
        """Test creating a basic task."""
        task = self.task_manager.create_task("Test Task")

        assert task is not None
        assert task.id == 1
        assert task.title == "Test Task"
        assert task.description == ""
        assert task.status == TaskStatus.PENDING
        assert task.priority == TaskPriority.MEDIUM

        # Verify task was added to collection
        all_tasks = self.task_manager.get_all_tasks()
        assert len(all_tasks) == 1
        assert all_tasks[0].id == 1

    def test_create_task_with_description_and_priority(self):
        """Test creating a task with description and priority."""
        title = "Test Task"
        description = "Test Description"
        priority = TaskPriority.HIGH

        task = self.task_manager.create_task(title, description, priority)

        assert task.title == title
        assert task.description == description
        assert task.priority == priority

    def test_create_multiple_tasks_id_generation(self):
        """Test that IDs are generated correctly for multiple tasks."""
        task1 = self.task_manager.create_task("Task 1")
        task2 = self.task_manager.create_task("Task 2")
        task3 = self.task_manager.create_task("Task 3")

        assert task1.id == 1
        assert task2.id == 2
        assert task3.id == 3

    def test_create_task_invalid_title(self):
        """Test creating a task with invalid title raises ValueError."""
        with pytest.raises(ValueError, match="Task title cannot be empty"):
            self.task_manager.create_task("")

        with pytest.raises(ValueError, match="Task title cannot be empty"):
            self.task_manager.create_task("   ")

        with pytest.raises(ValueError, match="Task title cannot be empty"):
            self.task_manager.create_task("\t\n")

    def test_get_task_existing(self):
        """Test getting an existing task."""
        created_task = self.task_manager.create_task("Test Task")
        retrieved_task = self.task_manager.get_task(created_task.id)

        assert retrieved_task is not None
        assert retrieved_task.id == created_task.id
        assert retrieved_task.title == created_task.title

    def test_get_task_nonexistent(self):
        """Test getting a non-existent task returns None."""
        result = self.task_manager.get_task(999)
        assert result is None

    def test_get_all_tasks(self):
        """Test getting all tasks."""
        # Initially empty
        assert self.task_manager.get_all_tasks() == []

        # After adding tasks
        task1 = self.task_manager.create_task("Task 1")
        task2 = self.task_manager.create_task("Task 2")

        all_tasks = self.task_manager.get_all_tasks()
        assert len(all_tasks) == 2
        assert task1 in all_tasks
        assert task2 in all_tasks

    def test_update_task_existing_fields(self):
        """Test updating various fields of an existing task."""
        original_task = self.task_manager.create_task("Original", "Original desc", TaskPriority.LOW)

        updated_task = self.task_manager.update_task(
            original_task.id,
            title="Updated",
            description="Updated desc",
            status=TaskStatus.IN_PROGRESS,
            priority=TaskPriority.HIGH
        )

        assert updated_task is not None
        assert updated_task.id == original_task.id
        assert updated_task.title == "Updated"
        assert updated_task.description == "Updated desc"
        assert updated_task.status == TaskStatus.IN_PROGRESS
        assert updated_task.priority == TaskPriority.HIGH

    def test_update_task_partial_fields(self):
        """Test updating only some fields of a task."""
        original_task = self.task_manager.create_task("Original", "Original desc", TaskPriority.LOW)

        # Only update the title
        updated_task = self.task_manager.update_task(original_task.id, title="Updated Title")

        assert updated_task.title == "Updated Title"
        assert updated_task.description == "Original desc"  # Unchanged
        assert updated_task.priority == TaskPriority.LOW    # Unchanged

    def test_update_task_nonexistent(self):
        """Test updating a non-existent task returns None."""
        result = self.task_manager.update_task(999, title="New Title")
        assert result is None

    def test_update_task_invalid_title(self):
        """Test updating with invalid title raises ValueError."""
        task = self.task_manager.create_task("Test Task")

        with pytest.raises(ValueError, match="Task title cannot be empty"):
            self.task_manager.update_task(task.id, title="")

    def test_update_task_invalid_status_transition(self):
        """Test invalid status transitions raise ValueError."""
        task = self.task_manager.create_task("Test Task")

        # Direct transition from pending to completed should fail
        with pytest.raises(ValueError, match="Invalid status transition"):
            self.task_manager.update_task(task.id, status=TaskStatus.COMPLETED)

    def test_update_task_completed_cannot_change(self):
        """Test that completed tasks cannot have their status changed."""
        task = self.task_manager.create_task("Test Task")
        # First move to in-progress, then to completed
        self.task_manager.update_task(task.id, status=TaskStatus.IN_PROGRESS)
        self.task_manager.update_task(task.id, status=TaskStatus.COMPLETED)

        # Now trying to change status should fail
        with pytest.raises(ValueError, match="Invalid status transition"):
            self.task_manager.update_task(task.id, status=TaskStatus.PENDING)

    def test_delete_task_existing(self):
        """Test deleting an existing task."""
        task = self.task_manager.create_task("Test Task")
        result = self.task_manager.delete_task(task.id)

        assert result is True
        assert self.task_manager.get_task(task.id) is None
        assert len(self.task_manager.get_all_tasks()) == 0

    def test_delete_task_nonexistent(self):
        """Test deleting a non-existent task."""
        result = self.task_manager.delete_task(999)
        assert result is False

    def test_is_valid_status_transition(self):
        """Test the status transition validation logic."""
        # Valid transitions
        assert self.task_manager._is_valid_status_transition(TaskStatus.PENDING, TaskStatus.IN_PROGRESS)
        assert self.task_manager._is_valid_status_transition(TaskStatus.IN_PROGRESS, TaskStatus.PENDING)
        assert self.task_manager._is_valid_status_transition(TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED)

        # Invalid transitions
        assert not self.task_manager._is_valid_status_transition(TaskStatus.PENDING, TaskStatus.COMPLETED)  # Direct
        assert not self.task_manager._is_valid_status_transition(TaskStatus.COMPLETED, TaskStatus.PENDING)  # Backwards
        assert not self.task_manager._is_valid_status_transition(TaskStatus.COMPLETED, TaskStatus.IN_PROGRESS)  # Backwards

    def test_filter_tasks_by_status(self):
        """Test filtering tasks by status."""
        task1 = self.task_manager.create_task("Task 1")
        task2 = self.task_manager.create_task("Task 2")
        task3 = self.task_manager.create_task("Task 3")

        # Change statuses
        self.task_manager.update_task(task2.id, status=TaskStatus.IN_PROGRESS)
        self.task_manager.update_task(task3.id, status=TaskStatus.IN_PROGRESS)  # First to in_progress
        self.task_manager.update_task(task3.id, status=TaskStatus.COMPLETED)   # Then to completed

        # Filter by pending
        pending_tasks = self.task_manager.filter_tasks(status=TaskStatus.PENDING)
        assert len(pending_tasks) == 1
        assert pending_tasks[0].id == task1.id

        # Filter by in-progress
        in_progress_tasks = self.task_manager.filter_tasks(status=TaskStatus.IN_PROGRESS)
        assert len(in_progress_tasks) == 1
        assert in_progress_tasks[0].id == task2.id

    def test_filter_tasks_by_priority(self):
        """Test filtering tasks by priority."""
        task1 = self.task_manager.create_task("Task 1", priority=TaskPriority.LOW)
        task2 = self.task_manager.create_task("Task 2", priority=TaskPriority.MEDIUM)
        task3 = self.task_manager.create_task("Task 3", priority=TaskPriority.HIGH)

        # Filter by low priority
        low_tasks = self.task_manager.filter_tasks(priority=TaskPriority.LOW)
        assert len(low_tasks) == 1
        assert low_tasks[0].id == task1.id

        # Filter by high priority
        high_tasks = self.task_manager.filter_tasks(priority=TaskPriority.HIGH)
        assert len(high_tasks) == 1
        assert high_tasks[0].id == task3.id

    def test_filter_tasks_by_both_status_and_priority(self):
        """Test filtering tasks by both status and priority."""
        task1 = self.task_manager.create_task("Task 1", priority=TaskPriority.HIGH)
        task2 = self.task_manager.create_task("Task 2", priority=TaskPriority.HIGH)
        task3 = self.task_manager.create_task("Task 3", priority=TaskPriority.LOW)

        # Change status of task2
        self.task_manager.update_task(task2.id, status=TaskStatus.IN_PROGRESS)

        # Filter for high priority AND in-progress status
        filtered = self.task_manager.filter_tasks(status=TaskStatus.IN_PROGRESS, priority=TaskPriority.HIGH)
        assert len(filtered) == 1
        assert filtered[0].id == task2.id

    def test_sort_tasks_by_priority(self):
        """Test sorting tasks by priority."""
        # Create tasks in a way that their IDs don't match priority order
        high_task = self.task_manager.create_task("High", priority=TaskPriority.HIGH)
        low_task = self.task_manager.create_task("Low", priority=TaskPriority.LOW)
        medium_task = self.task_manager.create_task("Medium", priority=TaskPriority.MEDIUM)

        # Sort by priority ascending (LOW -> MEDIUM -> HIGH)
        sorted_tasks = self.task_manager.sort_tasks('priority')
        assert sorted_tasks[0].priority == TaskPriority.LOW
        assert sorted_tasks[1].priority == TaskPriority.MEDIUM
        assert sorted_tasks[2].priority == TaskPriority.HIGH

        # Sort by priority descending (HIGH -> MEDIUM -> LOW)
        sorted_desc = self.task_manager.sort_tasks('priority', reverse=True)
        assert sorted_desc[0].priority == TaskPriority.HIGH
        assert sorted_desc[1].priority == TaskPriority.MEDIUM
        assert sorted_desc[2].priority == TaskPriority.LOW

    def test_sort_tasks_by_status(self):
        """Test sorting tasks by status."""
        pending_task = self.task_manager.create_task("Pending")
        completed_task = self.task_manager.create_task("Completed")
        self.task_manager.update_task(completed_task.id, status=TaskStatus.IN_PROGRESS)  # First to in_progress
        self.task_manager.update_task(completed_task.id, status=TaskStatus.COMPLETED)   # Then to completed

        in_progress_task = self.task_manager.create_task("In Progress")
        self.task_manager.update_task(in_progress_task.id, status=TaskStatus.IN_PROGRESS)

        # Sort by status ascending (PENDING -> IN_PROGRESS -> COMPLETED)
        sorted_tasks = self.task_manager.sort_tasks('status')
        assert sorted_tasks[0].status == TaskStatus.PENDING
        assert sorted_tasks[1].status == TaskStatus.IN_PROGRESS
        assert sorted_tasks[2].status == TaskStatus.COMPLETED

    def test_sort_tasks_by_created_at(self):
        """Test sorting tasks by creation date."""
        import time

        task1 = self.task_manager.create_task("First")
        time.sleep(0.001)  # Ensure different timestamp
        task2 = self.task_manager.create_task("Second")
        time.sleep(0.001)  # Ensure different timestamp
        task3 = self.task_manager.create_task("Third")

        # Sort by creation date ascending
        sorted_tasks = self.task_manager.sort_tasks('created_at')
        assert sorted_tasks[0].id == task1.id
        assert sorted_tasks[1].id == task2.id
        assert sorted_tasks[2].id == task3.id

        # Sort by creation date descending
        sorted_desc = self.task_manager.sort_tasks('created_at', reverse=True)
        assert sorted_desc[0].id == task3.id
        assert sorted_desc[1].id == task2.id
        assert sorted_desc[2].id == task1.id

    def test_search_tasks(self):
        """Test searching tasks by keyword."""
        task1 = self.task_manager.create_task("Buy groceries", "Milk, bread, eggs")
        task2 = self.task_manager.create_task("Call doctor", "Schedule appointment")
        task3 = self.task_manager.create_task("Finish report", "Important project")

        # Search in title
        results = self.task_manager.search_tasks("groceries")
        assert len(results) == 1
        assert results[0].id == task1.id

        # Search in description
        results = self.task_manager.search_tasks("appointment")
        assert len(results) == 1
        assert results[0].id == task2.id

        # Search with case insensitivity
        results = self.task_manager.search_tasks("GROCERIES")
        assert len(results) == 1
        assert results[0].id == task1.id

        # Search with no matches
        results = self.task_manager.search_tasks("nonexistent")
        assert len(results) == 0

        # Search for partial matches
        results = self.task_manager.search_tasks("gro")
        assert len(results) == 1
        assert results[0].id == task1.id