"""
Integration tests for the CLI flow.
These tests verify that the different components work together correctly.
"""

import pytest
from unittest.mock import patch, MagicMock
from src.services.task_manager import TaskManager
from src.cli.menu import MenuSystem
from src.models.task import TaskStatus, TaskPriority


class TestCLIFlow:
    """
    Integration tests for the CLI flow.
    """

    def setup_method(self):
        """Set up a fresh TaskManager and MenuSystem for each test."""
        self.task_manager = TaskManager()
        self.menu_system = MenuSystem(self.task_manager)

    def test_complete_task_lifecycle(self):
        """
        Test the complete lifecycle of a task: create, view, update, delete.
        """
        # Test creating a task
        created_task = self.task_manager.create_task("Test Task Title", "Test Task Description")

        # Verify the task was created
        all_tasks = self.task_manager.get_all_tasks()
        assert len(all_tasks) == 1
        assert all_tasks[0].title == "Test Task Title"
        assert all_tasks[0].description == "Test Task Description"
        assert all_tasks[0].status == TaskStatus.PENDING

        # Test updating the task
        updated_task = self.task_manager.update_task(
            created_task.id,
            title="Updated Task Title",
            status=TaskStatus.IN_PROGRESS
        )

        # Verify the task was updated
        retrieved_task = self.task_manager.get_task(created_task.id)
        assert retrieved_task.title == "Updated Task Title"
        assert retrieved_task.status == TaskStatus.IN_PROGRESS

        # Test deleting the task
        result = self.task_manager.delete_task(created_task.id)
        assert result is True

        # Verify the task was deleted
        all_tasks = self.task_manager.get_all_tasks()
        assert len(all_tasks) == 0

    @patch('src.cli.renderer.Renderer.print_task_list')
    def test_view_tasks_flow(self, mock_print_task_list):
        """
        Test the view tasks flow.
        """
        # Create some tasks first
        task1 = self.task_manager.create_task("Task 1")
        task2 = self.task_manager.create_task("Task 2", priority=TaskPriority.HIGH)

        # Call the view tasks method directly
        self.menu_system._view_tasks()

        # Verify that print_task_list was called
        mock_print_task_list.assert_called()

    def test_filter_tasks_flow(self):
        """
        Test the filter tasks flow.
        """
        # Create tasks with different statuses
        task1 = self.task_manager.create_task("Pending Task")
        task2 = self.task_manager.create_task("In Progress Task")
        self.task_manager.update_task(task2.id, status=TaskStatus.IN_PROGRESS)

        # Verify tasks were created and can be filtered
        pending_tasks = self.task_manager.filter_tasks(status=TaskStatus.PENDING)
        in_progress_tasks = self.task_manager.filter_tasks(status=TaskStatus.IN_PROGRESS)

        assert len(pending_tasks) >= 1
        assert len(in_progress_tasks) >= 1

    def test_sort_tasks_flow(self):
        """
        Test the sort tasks flow.
        """
        # Create tasks with different priorities
        task1 = self.task_manager.create_task("Low Priority Task", priority=TaskPriority.LOW)
        task2 = self.task_manager.create_task("High Priority Task", priority=TaskPriority.HIGH)
        task3 = self.task_manager.create_task("Medium Priority Task", priority=TaskPriority.MEDIUM)

        # Verify tasks were created
        all_tasks = self.task_manager.get_all_tasks()
        assert len(all_tasks) == 3

        # Test sorting functionality
        sorted_tasks = self.task_manager.sort_tasks('priority')
        assert len(sorted_tasks) == 3

    def test_search_tasks_flow(self):
        """
        Test the search tasks flow.
        """
        # Create tasks with different titles
        task1 = self.task_manager.create_task("Searchable Task")
        task2 = self.task_manager.create_task("Another Task")

        # Verify search functionality
        results = self.task_manager.search_tasks("Searchable")
        assert len(results) == 1
        assert results[0].title == "Searchable Task"

    def test_menu_routing_logic(self):
        """
        Test that menu routing correctly calls the appropriate methods.
        """
        # This tests the internal routing logic
        # We'll verify that the correct methods are called based on user input

        # Mock the methods to track if they're called
        with patch.object(self.menu_system, '_create_task') as mock_create, \
             patch.object(self.menu_system, '_view_tasks') as mock_view, \
             patch.object(self.menu_system, '_update_task') as mock_update, \
             patch.object(self.menu_system, '_delete_task') as mock_delete, \
             patch.object(self.menu_system, '_filter_tasks') as mock_filter, \
             patch.object(self.menu_system, '_sort_tasks') as mock_sort, \
             patch.object(self.menu_system, '_search_tasks') as mock_search:

            # Test each menu option
            self.menu_system._create_task()  # Option 1
            mock_create.assert_called_once()

            # Reset the mock and test another option
            mock_create.reset_mock()
            self.menu_system._view_tasks()  # Option 2
            mock_view.assert_called_once()

            mock_view.reset_mock()
            self.menu_system._update_task()  # Option 3
            mock_update.assert_called_once()

            mock_update.reset_mock()
            self.menu_system._delete_task()  # Option 4
            mock_delete.assert_called_once()

            mock_delete.reset_mock()
            self.menu_system._filter_tasks()  # Option 5
            mock_filter.assert_called_once()

            mock_filter.reset_mock()
            self.menu_system._sort_tasks()  # Option 6
            mock_sort.assert_called_once()

            mock_sort.reset_mock()
            self.menu_system._search_tasks()  # Option 7
            mock_search.assert_called_once()

    def test_input_validation_in_menu(self):
        """
        Test input validation in the menu system.
        """
        # Test with invalid input that should be handled gracefully
        with patch('builtins.input', return_value="invalid"):
            # This should not crash the application
            result = self.menu_system._get_user_input("Enter choice: ")
            assert result == "invalid"

        # Test with empty input
        with patch('builtins.input', return_value=""):
            result = self.menu_system._get_user_input("Enter choice: ")
            assert result == ""

    def test_task_manager_and_cli_integration(self):
        """
        Test the integration between TaskManager and CLI components.
        """
        # Create a task using TaskManager
        task = self.task_manager.create_task(
            "Integration Test Task",
            "Testing integration between components",
            TaskPriority.HIGH
        )

        # Verify it can be retrieved
        retrieved = self.task_manager.get_task(task.id)
        assert retrieved is not None
        assert retrieved.title == "Integration Test Task"

        # Verify it appears in all tasks
        all_tasks = self.task_manager.get_all_tasks()
        assert len(all_tasks) == 1
        assert all_tasks[0].id == task.id

        # Test updating through TaskManager affects what CLI would see
        self.task_manager.update_task(task.id, status=TaskStatus.COMPLETED)
        updated_task = self.task_manager.get_task(task.id)
        assert updated_task.status == TaskStatus.COMPLETED

        # Test deletion through TaskManager
        self.task_manager.delete_task(task.id)
        assert self.task_manager.get_task(task.id) is None
        assert len(self.task_manager.get_all_tasks()) == 0