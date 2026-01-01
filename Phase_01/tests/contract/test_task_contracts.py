"""
Contract tests for Task operations based on the API contracts defined in the spec.
These tests verify that the Task Manager adheres to the specified contracts.
"""

import pytest
from src.services.task_manager import TaskManager
from src.models.task import Task, TaskStatus, TaskPriority


class TestTaskContracts:
    """
    Contract tests for Task operations.
    """

    def setup_method(self):
        """Set up a fresh TaskManager for each test."""
        self.task_manager = TaskManager()

    def test_create_task_contract(self):
        """
        Contract test for Create Task operation.
        Input: title (string, required), description (string, optional), priority (enum: low/medium/high, default: medium)
        Output: Task object with all attributes including auto-generated id and timestamps
        Side effects: New task added to the task collection
        Validation: Title must not be empty
        Error cases: Invalid priority value, empty title
        """
        # Valid input test
        title = "Test Task"
        description = "This is a test task"
        priority = TaskPriority.HIGH

        task = self.task_manager.create_task(title, description, priority)

        assert task is not None
        assert task.title == title
        assert task.description == description
        assert task.priority == priority
        assert task.status == TaskStatus.PENDING  # Default status
        assert task.id is not None and task.id > 0
        assert task.created_at is not None
        assert task.updated_at is not None

        # Verify the task was added to the collection
        all_tasks = self.task_manager.get_all_tasks()
        assert len(all_tasks) == 1
        assert all_tasks[0].id == task.id

        # Test with default priority
        task2 = self.task_manager.create_task("Another task")
        assert task2.priority == TaskPriority.MEDIUM  # Default priority

        # Test validation: empty title should raise ValueError
        with pytest.raises(ValueError, match="Task title cannot be empty"):
            self.task_manager.create_task("")

        # Test validation: None title should raise ValueError
        with pytest.raises(ValueError, match="Task title cannot be empty"):
            self.task_manager.create_task(None)

    def test_get_all_tasks_contract(self):
        """
        Contract test for Get All Tasks operation.
        Input: None
        Output: Array of Task objects
        Side effects: None
        Validation: None
        Error cases: None
        """
        # Initially, should return empty list
        tasks = self.task_manager.get_all_tasks()
        assert tasks == []

        # After creating tasks, should return all tasks
        task1 = self.task_manager.create_task("Task 1")
        task2 = self.task_manager.create_task("Task 2")

        tasks = self.task_manager.get_all_tasks()
        assert len(tasks) == 2
        assert task1 in tasks
        assert task2 in tasks

    def test_get_task_by_id_contract(self):
        """
        Contract test for Get Task by ID operation.
        Input: task_id (integer, required)
        Output: Single Task object or null if not found
        Side effects: None
        Validation: task_id must be positive integer
        Error cases: Task not found
        """
        # Create a task first
        original_task = self.task_manager.create_task("Test Task")

        # Valid ID should return the task
        retrieved_task = self.task_manager.get_task(original_task.id)
        assert retrieved_task is not None
        assert retrieved_task.id == original_task.id
        assert retrieved_task.title == original_task.title

        # Non-existent ID should return None
        non_existent_task = self.task_manager.get_task(999)
        assert non_existent_task is None

    def test_update_task_contract(self):
        """
        Contract test for Update Task operation.
        Input: task_id (integer, required), fields to update (title, description, status, priority)
        Output: Updated Task object
        Side effects: Task modified in collection
        Validation: task_id must exist, status/priority must be valid
        Error cases: Task not found, invalid status transition
        """
        # Create a task to update
        original_task = self.task_manager.create_task("Original Task", "Original description")

        # Update with valid fields
        updated_task = self.task_manager.update_task(
            original_task.id,
            title="Updated Task",
            description="Updated description",
            status=TaskStatus.IN_PROGRESS,
            priority=TaskPriority.HIGH
        )

        assert updated_task is not None
        assert updated_task.id == original_task.id
        assert updated_task.title == "Updated Task"
        assert updated_task.description == "Updated description"
        assert updated_task.status == TaskStatus.IN_PROGRESS
        assert updated_task.priority == TaskPriority.HIGH

        # Verify the task was updated in the collection
        retrieved_task = self.task_manager.get_task(original_task.id)
        assert retrieved_task.title == "Updated Task"

        # Test error case: updating non-existent task
        result = self.task_manager.update_task(999, title="New Title")
        assert result is None

        # Test validation: invalid status transition (pending -> completed directly)
        pending_task = self.task_manager.create_task("Pending task")
        with pytest.raises(ValueError, match="Invalid status transition"):
            self.task_manager.update_task(pending_task.id, status=TaskStatus.COMPLETED)

        # Test validation: completed task cannot be changed
        completed_task = self.task_manager.create_task("Completed task")
        self.task_manager.update_task(completed_task.id, status=TaskStatus.IN_PROGRESS)  # First change to in_progress
        self.task_manager.update_task(completed_task.id, status=TaskStatus.COMPLETED)   # Then to completed
        with pytest.raises(ValueError, match="Invalid status transition"):
            self.task_manager.update_task(completed_task.id, status=TaskStatus.PENDING)

    def test_delete_task_contract(self):
        """
        Contract test for Delete Task operation.
        Input: task_id (integer, required)
        Output: Boolean indicating success
        Side effects: Task removed from collection
        Validation: task_id must exist
        Error cases: Task not found
        """
        # Create a task to delete
        task_to_delete = self.task_manager.create_task("Task to delete")

        # Valid deletion should return True
        result = self.task_manager.delete_task(task_to_delete.id)
        assert result is True

        # Task should no longer exist
        retrieved_task = self.task_manager.get_task(task_to_delete.id)
        assert retrieved_task is None

        # Deleting non-existent task should return False
        result = self.task_manager.delete_task(999)
        assert result is False

    def test_filter_tasks_contract(self):
        """
        Contract test for Filter Tasks operation.
        Input: filter criteria (status, priority, date range)
        Output: Array of Task objects matching criteria
        Side effects: None
        Validation: Filter parameters must be valid
        Error cases: Invalid filter criteria
        """
        # Create tasks with different statuses and priorities
        task1 = self.task_manager.create_task("Task 1", priority=TaskPriority.LOW)
        task2 = self.task_manager.create_task("Task 2", priority=TaskPriority.MEDIUM)
        task3 = self.task_manager.create_task("Task 3", priority=TaskPriority.HIGH)

        # Update statuses following valid transitions
        self.task_manager.update_task(task1.id, status=TaskStatus.IN_PROGRESS)  # First to in_progress
        self.task_manager.update_task(task1.id, status=TaskStatus.COMPLETED)   # Then to completed
        self.task_manager.update_task(task2.id, status=TaskStatus.IN_PROGRESS)

        # Filter by priority
        low_priority_tasks = self.task_manager.filter_tasks(priority=TaskPriority.LOW)
        assert len(low_priority_tasks) == 1
        assert low_priority_tasks[0].id == task1.id

        # Filter by status
        completed_tasks = self.task_manager.filter_tasks(status=TaskStatus.COMPLETED)
        assert len(completed_tasks) == 1
        assert completed_tasks[0].id == task1.id

        # Filter by both status and priority
        high_priority_pending_tasks = self.task_manager.filter_tasks(
            status=TaskStatus.PENDING,
            priority=TaskPriority.HIGH
        )
        assert len(high_priority_pending_tasks) == 1
        assert high_priority_pending_tasks[0].id == task3.id

        # Filter with no matches
        completed_high_tasks = self.task_manager.filter_tasks(
            status=TaskStatus.COMPLETED,
            priority=TaskPriority.HIGH
        )
        assert len(completed_high_tasks) == 0

    def test_sort_tasks_contract(self):
        """
        Contract test for Sort Tasks operation.
        Input: sort criteria (priority, status, creation date, etc.)
        Output: Array of Task objects in sorted order
        Side effects: None
        Validation: Sort parameters must be valid
        Error cases: Invalid sort criteria
        """
        # Create tasks (they'll have slightly different creation times)
        task1 = self.task_manager.create_task("Task 1", priority=TaskPriority.HIGH)
        task2 = self.task_manager.create_task("Task 2", priority=TaskPriority.LOW)
        task3 = self.task_manager.create_task("Task 3", priority=TaskPriority.MEDIUM)

        # Sort by priority (HIGH > MEDIUM > LOW)
        sorted_by_priority = self.task_manager.sort_tasks('priority')
        # The HIGH priority task should be first
        assert sorted_by_priority[0].priority == TaskPriority.HIGH
        assert sorted_by_priority[2].priority == TaskPriority.LOW

        # Sort by priority descending
        sorted_by_priority_desc = self.task_manager.sort_tasks('priority', reverse=True)
        assert sorted_by_priority_desc[0].priority == TaskPriority.LOW
        assert sorted_by_priority_desc[2].priority == TaskPriority.HIGH

        # Sort by creation date
        sorted_by_date = self.task_manager.sort_tasks('created_at')
        # The first created task should be first (ascending order)
        assert sorted_by_date[0].id == task1.id

        # Sort by creation date descending
        sorted_by_date_desc = self.task_manager.sort_tasks('created_at', reverse=True)
        # The last created task should be first (descending order)
        assert sorted_by_date_desc[0].id == task3.id

        # Test with invalid sort field (should default to ID)
        sorted_default = self.task_manager.sort_tasks('invalid_field')
        # Should be sorted by ID
        assert sorted_default[0].id == task1.id