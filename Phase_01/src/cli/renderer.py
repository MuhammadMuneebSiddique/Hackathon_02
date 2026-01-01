import os
from typing import List, Dict
from colorama import init, Fore, Style
from src.models.task import Task, TaskStatus, TaskPriority


# Initialize colorama
init(autoreset=True)


class Renderer:
    """
    Basic CLI renderer for the TODO application.
    Provides functions for rendering UI elements with proper formatting.
    """

    def __init__(self):
        self.width = 80

    def clear_screen(self):
        """Clear the terminal screen."""
        os.system('cls' if os.name == 'nt' else 'clear')

    def print_header(self, title: str = "TODO Application"):
        """Print a centered header/title banner."""
        print(f"\n{Fore.CYAN}{Style.BRIGHT}{'=' * self.width}")
        title_padding = (self.width - len(title)) // 2
        print(f"{' ' * title_padding}{title}{' ' * (self.width - len(title) - title_padding)}")
        print(f"{'=' * self.width}{Style.RESET_ALL}")

    def print_divider(self, char: str = "-"):
        """Print a horizontal divider line."""
        print(f"{Fore.YELLOW}{char * self.width}{Style.RESET_ALL}")

    def print_section_header(self, title: str):
        """Print a section header with styling."""
        print(f"\n{Fore.MAGENTA}{Style.BRIGHT}{title}{Style.RESET_ALL}")
        print(f"{Fore.MAGENTA}{'-' * len(title)}{Style.RESET_ALL}")

    def print_task_list(self, tasks: List[Task], title: str = "Tasks"):
        """Render a list of tasks with proper formatting and colors."""
        if not tasks:
            self.print_empty_state("No tasks to display")
            return

        self.print_section_header(title)
        print(f"{Fore.CYAN}{'ID':<4} {'Status':<12} {'Priority':<10} {'Title':<30}{Style.RESET_ALL}")
        print(f"{Fore.CYAN}{'-' * 4} {'-' * 12} {'-' * 10} {'-' * 30}{Style.RESET_ALL}")

        for task in tasks:
            # Set color based on status
            if task.status == TaskStatus.COMPLETED:
                status_color = Fore.GREEN
            elif task.status == TaskStatus.IN_PROGRESS:
                status_color = Fore.BLUE
            else:  # PENDING
                status_color = Fore.YELLOW

            # Set priority indicator
            if task.priority == TaskPriority.HIGH:
                priority_indicator = f"{Fore.RED}🔺 HIGH"
            elif task.priority == TaskPriority.MEDIUM:
                priority_indicator = f"{Fore.YELLOW}🔸 MED"
            else:  # LOW
                priority_indicator = f"{Fore.CYAN}🔽 LOW"

            # Format status text
            status_text = task.status.value.replace('_', ' ').title()

            # Truncate title if too long
            truncated_title = task.title[:30] if len(task.title) > 30 else task.title
            print(f"{status_color}{task.id:<4} {status_text:<12} {priority_indicator:<12} {truncated_title:<30}")

    def print_error_handling_examples(self):
        """Print examples of how errors are handled in the UI."""
        # This method demonstrates error handling, though it's not directly used in the app
        pass

    def print_tasks_by_status(self, tasks_by_status: Dict[TaskStatus, List[Task]]):
        """Render tasks grouped by status."""
        for status in [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED]:
            status_tasks = tasks_by_status.get(status, [])
            if status_tasks:
                # Set header color based on status
                if status == TaskStatus.COMPLETED:
                    header_color = Fore.GREEN
                elif status == TaskStatus.IN_PROGRESS:
                    header_color = Fore.BLUE
                else:  # PENDING
                    header_color = Fore.YELLOW

                print(f"\n{header_color}{Style.BRIGHT}{status.value.replace('_', ' ').title()} Tasks:{Style.RESET_ALL}")
                print(f"{header_color}{'-' * (len(status.value.replace('_', ' ')) + 7)}{Style.RESET_ALL}")

                for task in status_tasks:
                    priority_indicator = {
                        TaskPriority.HIGH: f"{Fore.RED}🔺",
                        TaskPriority.MEDIUM: f"{Fore.YELLOW}🔸",
                        TaskPriority.LOW: f"{Fore.CYAN}🔽"
                    }[task.priority]

                    print(f"{header_color}  [{task.id}] {priority_indicator} {task.title}{Style.RESET_ALL}")

        if all(len(tasks) == 0 for tasks in tasks_by_status.values()):
            self.print_empty_state("No tasks to display")

    def print_tasks_by_priority(self, tasks_by_priority: Dict[TaskPriority, List[Task]]):
        """Render tasks grouped by priority."""
        priority_order = [TaskPriority.HIGH, TaskPriority.MEDIUM, TaskPriority.LOW]

        for priority in priority_order:
            priority_tasks = tasks_by_priority.get(priority, [])
            if priority_tasks:
                # Set header color based on priority
                if priority == TaskPriority.HIGH:
                    header_color = Fore.RED
                    priority_text = "HIGH PRIORITY"
                    icon = "🔺"
                elif priority == TaskPriority.MEDIUM:
                    header_color = Fore.YELLOW
                    priority_text = "MEDIUM PRIORITY"
                    icon = "🔸"
                else:  # LOW
                    header_color = Fore.CYAN
                    priority_text = "LOW PRIORITY"
                    icon = "🔽"

                print(f"\n{header_color}{Style.BRIGHT}{icon} {priority_text} Tasks:{Style.RESET_ALL}")
                print(f"{header_color}{'-' * (len(priority_text) + 8)}{Style.RESET_ALL}")

                for task in priority_tasks:
                    status_icon = {
                        TaskStatus.PENDING: "⏳",
                        TaskStatus.IN_PROGRESS: "🔄",
                        TaskStatus.COMPLETED: "✅"
                    }[task.status]

                    status_color = {
                        TaskStatus.COMPLETED: Fore.GREEN,
                        TaskStatus.IN_PROGRESS: Fore.BLUE,
                        TaskStatus.PENDING: Fore.YELLOW
                    }[task.status]

                    print(f"{status_color}  [{task.id}] {status_icon} {task.title}{Style.RESET_ALL}")

        if all(len(tasks) == 0 for tasks in tasks_by_priority.values()):
            self.print_empty_state("No tasks to display")

    def print_task(self, task: Task):
        """Print a single task with detailed information."""
        if task.status == TaskStatus.COMPLETED:
            status_color = Fore.GREEN
        elif task.status == TaskStatus.IN_PROGRESS:
            status_color = Fore.BLUE
        else:  # PENDING
            status_color = Fore.YELLOW

        print(f"\n{status_color}{Style.BRIGHT}Task #{task.id}{Style.RESET_ALL}")
        print(f"{Fore.CYAN}Title:{Style.RESET_ALL} {task.title}")
        print(f"{Fore.CYAN}Description:{Style.RESET_ALL} {task.description or 'N/A'}")
        print(f"{Fore.CYAN}Status:{Style.RESET_ALL} {status_color}{task.status.value.replace('_', ' ').title()}{Style.RESET_ALL}")
        print(f"{Fore.CYAN}Priority:{Style.RESET_ALL} {task.priority.value.upper()}")
        print(f"{Fore.CYAN}Created:{Style.RESET_ALL} {task.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{Fore.CYAN}Updated:{Style.RESET_ALL} {task.updated_at.strftime('%Y-%m-%d %H:%M:%S')}")

    def print_message(self, message: str, color: str = Fore.WHITE):
        """Print a message with specified color."""
        print(f"{color}{message}{Style.RESET_ALL}")

    def print_success(self, message: str):
        """Print a success message in green."""
        self.print_message(message, Fore.GREEN)

    def print_error(self, message: str):
        """Print an error message in red."""
        self.print_message(message, Fore.RED)

    def print_warning(self, message: str):
        """Print a warning message in yellow."""
        self.print_message(message, Fore.YELLOW)

    def print_info(self, message: str):
        """Print an info message in blue."""
        self.print_message(message, Fore.BLUE)

    def print_empty_state(self, message: str = "No items to display"):
        """Print an empty state message."""
        self.print_warning(f"⚠️  {message}")