from typing import Optional
from src.services.task_manager import TaskManager
from src.models.task import Task, TaskStatus, TaskPriority
from src.cli.renderer import Renderer


class MenuSystem:
    """
    Menu system and user interaction handler for the TODO application.
    Provides the main menu and handles user input routing.
    """

    def __init__(self, task_manager: TaskManager):
        self.task_manager = task_manager
        self.renderer = Renderer()
        self.running = True

    def run(self):
        """
        Main application loop that displays menu and handles user input.
        """
        while self.running:
            self._display_main_menu()
            choice = self._get_user_input("Enter your choice: ")

            if choice == "1":
                self._create_task()
            elif choice == "2":
                self._view_tasks()
            elif choice == "3":
                self._update_task()
            elif choice == "4":
                self._delete_task()
            elif choice == "5":
                self._filter_tasks()
            elif choice == "6":
                self._sort_tasks()
            elif choice == "7":
                self._search_tasks()
            elif choice == "q" or choice == "Q":
                self._exit_application()
            else:
                self.renderer.print_error("Invalid choice. Please try again.")

    def _display_main_menu(self):
        """
        Display the main menu options.
        """
        self.renderer.clear_screen()
        self.renderer.print_header("TODO Application - Main Menu")
        print("\n1. Create Task")
        print("2. View All Tasks")
        print("3. Update Task")
        print("4. Delete Task")
        print("5. Filter Tasks")
        print("6. Sort Tasks")
        print("7. Search Tasks")
        print("Q. Quit")
        print("\n" + "="*50)

    def _get_user_input(self, prompt: str) -> str:
        """
        Get input from the user with a prompt.
        """
        try:
            return input(prompt).strip()
        except EOFError:
            return "q"  # Return quit command if input fails

    def _create_task(self):
        """
        Handle task creation workflow.
        """
        self.renderer.clear_screen()
        self.renderer.print_header("Create New Task")

        title = self._get_user_input("Enter task title: ")
        if not title:
            self.renderer.print_error("Task title cannot be empty.")
            input("\nPress Enter to continue...")
            return

        # Validate title length
        if len(title) > 200:
            self.renderer.print_error("Task title is too long (maximum 200 characters).")
            input("\nPress Enter to continue...")
            return

        description = self._get_user_input("Enter task description (optional, press Enter to skip): ")

        # Validate description length
        if description and len(description) > 2000:
            self.renderer.print_error("Task description is too long (maximum 2000 characters).")
            input("\nPress Enter to continue...")
            return

        if not description:
            description = None

        print("\nSelect priority:")
        print("1. Low")
        print("2. Medium (default)")
        print("3. High")
        priority_choice = self._get_user_input("Enter choice (1-3, default 2): ")

        priority = TaskPriority.MEDIUM  # default
        if priority_choice == "1":
            priority = TaskPriority.LOW
        elif priority_choice == "3":
            priority = TaskPriority.HIGH

        try:
            task = self.task_manager.create_task(title, description, priority)
            self.renderer.print_success(f"Task created successfully with ID: {task.id}")
        except ValueError as e:
            self.renderer.print_error(f"Error creating task: {e}")

        input("\nPress Enter to continue...")

    def _view_tasks(self):
        """
        Display all tasks.
        """
        self.renderer.clear_screen()
        self.renderer.print_header("All Tasks")

        tasks = self.task_manager.get_all_tasks()
        if tasks:
            self.renderer.print_task_list(tasks)
        else:
            self.renderer.print_empty_state("No tasks available")

        input("\nPress Enter to continue...")

    def _update_task(self):
        """
        Handle task update workflow.
        """
        self.renderer.clear_screen()
        self.renderer.print_header("Update Task")

        if not self.task_manager.get_all_tasks():
            self.renderer.print_warning("No tasks available to update.")
            input("\nPress Enter to continue...")
            return

        self._view_tasks()
        task_id_str = self._get_user_input("Enter task ID to update: ")
        try:
            task_id = int(task_id_str)
        except ValueError:
            self.renderer.print_error("Invalid task ID. Must be a number.")
            input("\nPress Enter to continue...")
            return

        task = self.task_manager.get_task(task_id)
        if not task:
            self.renderer.print_error(f"Task with ID {task_id} not found.")
            input("\nPress Enter to continue...")
            return

        self.renderer.print_info("Current task details:")
        self.renderer.print_task(task)

        print("\nLeave blank to keep current value.")
        new_title = self._get_user_input(f"New title (current: {task.title}): ")
        if not new_title:
            new_title = None

        new_description = self._get_user_input(f"New description (current: {task.description}): ")
        if new_description == "":
            new_description = None

        print(f"\nCurrent status: {task.status.value}")
        print("Available statuses:")
        print("1. pending")
        print("2. in_progress")
        print("3. completed")
        status_choice = self._get_user_input("Enter new status number (or blank to keep current): ")
        new_status = None
        if status_choice == "1":
            new_status = TaskStatus.PENDING
        elif status_choice == "2":
            new_status = TaskStatus.IN_PROGRESS
        elif status_choice == "3":
            new_status = TaskStatus.COMPLETED

        print(f"\nCurrent priority: {task.priority.value}")
        print("Available priorities:")
        print("1. low")
        print("2. medium")
        print("3. high")
        priority_choice = self._get_user_input("Enter new priority number (or blank to keep current): ")
        new_priority = None
        if priority_choice == "1":
            new_priority = TaskPriority.LOW
        elif priority_choice == "2":
            new_priority = TaskPriority.MEDIUM
        elif priority_choice == "3":
            new_priority = TaskPriority.HIGH

        try:
            updated_task = self.task_manager.update_task(
                task_id, new_title, new_description, new_status, new_priority
            )
            if updated_task:
                self.renderer.print_success("Task updated successfully!")
            else:
                self.renderer.print_error("Failed to update task.")
        except ValueError as e:
            self.renderer.print_error(f"Error updating task: {e}")

        input("\nPress Enter to continue...")

    def _delete_task(self):
        """
        Handle task deletion workflow.
        """
        self.renderer.clear_screen()
        self.renderer.print_header("Delete Task")

        if not self.task_manager.get_all_tasks():
            self.renderer.print_warning("No tasks available to delete.")
            input("\nPress Enter to continue...")
            return

        self._view_tasks()
        task_id_str = self._get_user_input("Enter task ID to delete: ")
        try:
            task_id = int(task_id_str)
        except ValueError:
            self.renderer.print_error("Invalid task ID. Must be a number.")
            input("\nPress Enter to continue...")
            return

        if self._confirm_action(f"Are you sure you want to delete task {task_id}? (y/N): "):
            if self.task_manager.delete_task(task_id):
                self.renderer.print_success("Task deleted successfully!")
            else:
                self.renderer.print_error(f"Task with ID {task_id} not found.")
        else:
            self.renderer.print_info("Task deletion cancelled.")

        input("\nPress Enter to continue...")

    def _filter_tasks(self):
        """
        Handle task filtering workflow.
        """
        self.renderer.clear_screen()
        self.renderer.print_header("Filter Tasks")

        print("Filter by:")
        print("1. Status")
        print("2. Priority")
        print("3. Both Status and Priority")

        filter_choice = self._get_user_input("Enter choice (1-3): ")

        status_filter = None
        priority_filter = None

        if filter_choice in ["1", "3"]:
            print("\nAvailable statuses:")
            print("1. pending")
            print("2. in_progress")
            print("3. completed")
            status_choice = self._get_user_input("Enter status number: ")
            if status_choice == "1":
                status_filter = TaskStatus.PENDING
            elif status_choice == "2":
                status_filter = TaskStatus.IN_PROGRESS
            elif status_choice == "3":
                status_filter = TaskStatus.COMPLETED

        if filter_choice in ["2", "3"]:
            print("\nAvailable priorities:")
            print("1. low")
            print("2. medium")
            print("3. high")
            priority_choice = self._get_user_input("Enter priority number: ")
            if priority_choice == "1":
                priority_filter = TaskPriority.LOW
            elif priority_choice == "2":
                priority_filter = TaskPriority.MEDIUM
            elif priority_choice == "3":
                priority_filter = TaskPriority.HIGH

        filtered_tasks = self.task_manager.filter_tasks(status_filter, priority_filter)

        if filtered_tasks:
            self.renderer.print_task_list(filtered_tasks, "Filtered Tasks")
        else:
            self.renderer.print_empty_state("No tasks match the filter criteria")

        input("\nPress Enter to continue...")

    def _sort_tasks(self):
        """
        Handle task sorting workflow.
        """
        self.renderer.clear_screen()
        self.renderer.print_header("Sort Tasks")

        print("Sort by:")
        print("1. Priority")
        print("2. Status")
        print("3. Creation Date")

        sort_choice = self._get_user_input("Enter choice (1-3): ")
        sort_field = "priority"

        if sort_choice == "2":
            sort_field = "status"
        elif sort_choice == "3":
            sort_field = "created_at"

        print("\nOrder:")
        print("1. Ascending")
        print("2. Descending")
        order_choice = self._get_user_input("Enter choice (1-2, default 1): ")
        reverse = order_choice == "2"

        sorted_tasks = self.task_manager.sort_tasks(sort_field, reverse)

        if sorted_tasks:
            self.renderer.print_task_list(sorted_tasks, f"Tasks Sorted by {sort_field}")
        else:
            self.renderer.print_empty_state("No tasks to sort")

        input("\nPress Enter to continue...")

    def _search_tasks(self):
        """
        Handle task search workflow.
        """
        self.renderer.clear_screen()
        self.renderer.print_header("Search Tasks")

        keyword = self._get_user_input("Enter keyword to search: ")
        if not keyword:
            self.renderer.print_warning("Search keyword cannot be empty.")
            input("\nPress Enter to continue...")
            return

        # Limit keyword length to prevent performance issues
        if len(keyword) > 100:
            self.renderer.print_error("Search keyword is too long (maximum 100 characters).")
            input("\nPress Enter to continue...")
            return

        matching_tasks = self.task_manager.search_tasks(keyword)

        if matching_tasks:
            self.renderer.print_task_list(matching_tasks, f"Search Results for '{keyword}'")
        else:
            self.renderer.print_empty_state(f"No tasks found containing '{keyword}'")

        input("\nPress Enter to continue...")

    def _confirm_action(self, prompt: str) -> bool:
        """
        Get confirmation from the user for destructive actions.
        """
        response = self._get_user_input(prompt)
        return response.lower() in ['y', 'yes', 'Y', 'YES']

    def _exit_application(self):
        """
        Handle application exit.
        """
        if self._confirm_action("Are you sure you want to quit? (y/N): "):
            self.renderer.print_info("Thank you for using the TODO Application!")
            self.running = False
        else:
            self.renderer.print_info("Exit cancelled.")