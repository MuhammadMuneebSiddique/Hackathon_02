from typing import Dict, List, Optional, Tuple
from datetime import datetime
from src.models.task import Task, TaskStatus, TaskPriority
from src.lib.utils import validate_title, validate_status, validate_priority


class TaskManager:
    """
    Central Task Manager that owns all task data and enforces ID generation.
    Provides CRUD operations for tasks and validates all task operations.
    """

    def __init__(self):
        self._tasks: Dict[int, Task] = {}
        self._next_id = 1

    def _generate_id(self) -> int:
        """Generate a unique ID for a new task."""
        new_id = self._next_id
        self._next_id += 1
        return new_id

    def create_task(self, title: str, description: Optional[str] = None,
        priority: TaskPriority = TaskPriority.MEDIUM) -> Task:
        """
        Create a new task with the given parameters.

        Args:
            title: Task title (required, non-empty)
            description: Task description (optional)
            priority: Task priority (default: medium)

        Returns:
            The created Task object

        Raises:
            ValueError: If title is empty or priority is invalid
        """
        if not validate_title(title):
            raise ValueError("Task title cannot be empty or only whitespace")

        if not validate_priority(priority.value):
            raise ValueError(f"Invalid priority value: {priority}")

        task_id = self._generate_id()
        task = Task(
            id=task_id,
            title=title,
            description=description,
            priority=priority
        )

        self._tasks[task_id] = task
        return task

    def get_task(self, task_id: int) -> Optional[Task]:
        """
        Retrieve a task by its ID.

        Args:
            task_id: The ID of the task to retrieve

        Returns:
            The Task object if found, None otherwise
        """
        return self._tasks.get(task_id)

    def get_all_tasks(self) -> List[Task]:
        """
        Retrieve all tasks.

        Returns:
            A list of all Task objects
        """
        return list(self._tasks.values())

    def update_task(self, task_id: int, title: Optional[str] = None,
                   description: Optional[str] = None, status: Optional[TaskStatus] = None,
                   priority: Optional[TaskPriority] = None) -> Optional[Task]:
        """
        Update an existing task with the given parameters.

        Args:
            task_id: The ID of the task to update
            title: New title (optional)
            description: New description (optional)
            status: New status (optional)
            priority: New priority (optional)

        Returns:
            The updated Task object if successful, None if task not found

        Raises:
            ValueError: If invalid status transition or invalid values
        """
        task = self._tasks.get(task_id)
        if not task:
            return None

        # Validate and update title if provided
        if title is not None:
            if not validate_title(title):
                raise ValueError("Task title cannot be empty or only whitespace")
            task.title = title

        # Validate and update description if provided
        if description is not None:
            task.description = description

        # Validate and update status if provided
        if status is not None:
            if not validate_status(status.value):
                raise ValueError(f"Invalid status value: {status}")

            # Check for valid state transitions
            if not self._is_valid_status_transition(task.status, status):
                raise ValueError(f"Invalid status transition: {task.status.value} -> {status.value}")

            task.status = status

        # Validate and update priority if provided
        if priority is not None:
            if not validate_priority(priority.value):
                raise ValueError(f"Invalid priority value: {priority}")
            task.priority = priority

        task.update_timestamp()
        return task

    def delete_task(self, task_id: int) -> bool:
        """
        Delete a task by its ID.

        Args:
            task_id: The ID of the task to delete

        Returns:
            True if the task was deleted, False if not found
        """
        if task_id in self._tasks:
            del self._tasks[task_id]
            return True
        return False

    def _is_valid_status_transition(self, current_status: TaskStatus, new_status: TaskStatus) -> bool:
        """
        Check if a status transition is valid according to business rules.

        Args:
            current_status: Current status of the task
            new_status: Proposed new status

        Returns:
            True if the transition is valid, False otherwise
        """
        # Completed tasks cannot change status
        if current_status == TaskStatus.COMPLETED:
            return False

        # Cannot transition directly from pending to completed
        if (current_status == TaskStatus.PENDING and
            new_status == TaskStatus.COMPLETED):
            return False

        return True

    def filter_tasks(self, status: Optional[TaskStatus] = None,
                    priority: Optional[TaskPriority] = None) -> List[Task]:
        """
        Filter tasks based on status and/or priority.

        Args:
            status: Filter by status (optional)
            priority: Filter by priority (optional)

        Returns:
            List of tasks matching the filter criteria
        """
        filtered_tasks = []

        for task in self._tasks.values():
            match = True

            if status is not None and task.status != status:
                match = False

            if priority is not None and task.priority != priority:
                match = False

            if match:
                filtered_tasks.append(task)

        return filtered_tasks

    def sort_tasks(self, sort_by: str, reverse: bool = False) -> List[Task]:
        """
        Sort tasks based on the specified attribute.

        Args:
            sort_by: Attribute to sort by ('priority', 'status', 'created_at')
            reverse: Whether to sort in reverse order (default: False)

        Returns:
            List of tasks sorted according to the specified attribute
        """
        if sort_by == 'priority':
            # Sort by priority with HIGH > MEDIUM > LOW (default is descending for priority)
            priority_order = {TaskPriority.HIGH: 3, TaskPriority.MEDIUM: 2, TaskPriority.LOW: 1}
            # For priority, we want HIGH first by default, so we reverse the sort
            return sorted(self._tasks.values(),
                         key=lambda t: priority_order[t.priority],
                         reverse=True)  # Sort descending by default for priority (HIGH first)
        elif sort_by == 'status':
            # Sort by status with PENDING > IN_PROGRESS > COMPLETED (default is descending for status)
            status_order = {TaskStatus.PENDING: 3, TaskStatus.IN_PROGRESS: 2, TaskStatus.COMPLETED: 1}
            # For status, we want PENDING first by default, so we reverse the sort
            return sorted(self._tasks.values(),
                         key=lambda t: status_order[t.status],
                         reverse=True)  # Sort descending by default for status (PENDING first)
        elif sort_by == 'created_at':
            return sorted(self._tasks.values(),
                         key=lambda t: t.created_at,
                         reverse=reverse)
        else:
            # Default sort by ID
            return sorted(self._tasks.values(),
                         key=lambda t: t.id,
                         reverse=reverse)

    def search_tasks(self, keyword: str) -> List[Task]:
        """
        Search tasks by keyword in title and description.

        Args:
            keyword: Keyword to search for

        Returns:
            List of tasks containing the keyword in title or description
        """
        if not keyword:
            return []

        keyword_lower = keyword.lower()
        matching_tasks = []

        for task in self._tasks.values():
            if (keyword_lower in task.title.lower() or
                (task.description and keyword_lower in task.description.lower())):
                matching_tasks.append(task)

        return matching_tasks