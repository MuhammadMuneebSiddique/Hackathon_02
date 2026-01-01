from src.services.task_manager import TaskManager
from src.cli.menu import MenuSystem


class TodoApp:
    """
    Main application entry point for the TODO application.
    Orchestrates the interaction between the task manager and the CLI menu system.
    """

    def __init__(self):
        self.task_manager = TaskManager()
        self.menu_system = MenuSystem(self.task_manager)

    def run(self):
        """
        Run the main application loop.
        """
        print("Starting TODO Application...")
        try:
            self.menu_system.run()
        except KeyboardInterrupt:
            print("\n\nApplication interrupted by user.")
        except Exception as e:
            print(f"\nAn unexpected error occurred: {e}")
        finally:
            self.cleanup()

    def cleanup(self):
        """
        Perform any necessary cleanup before exiting.
        """
        # Any cleanup operations would go here
        print("\nPerforming cleanup operations...")
        # For now, just print a message
        # In the future, we could add operations like saving to file, etc.


def main():
    """
    Main entry point function.
    """
    app = TodoApp()
    try:
        app.run()
    except KeyboardInterrupt:
        print("\n\nApplication interrupted by user.")
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")
    finally:
        app.cleanup()
        print("\nGoodbye!")


if __name__ == "__main__":
    main()