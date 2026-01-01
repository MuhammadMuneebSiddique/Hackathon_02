# In-Memory Python Console TODO Application

A simple, in-memory TODO application with a console-based user interface. This application allows users to create, manage, and organize tasks with priority and status tracking.

## Features

- **Task Management**: Create, view, update, and delete tasks
- **Status Tracking**: Tasks can be marked as Pending, In Progress, or Completed
- **Priority Levels**: Tasks can be assigned Low, Medium, or High priority
- **Filtering & Sorting**: Filter and sort tasks by status and priority
- **Search Functionality**: Search tasks by title or description
- **Visual Feedback**: Color-coded status indicators and priority icons
- **User-Friendly Interface**: Simple menu-driven console interface

## Prerequisites

- Python 3.11 or higher
- pip package manager

## Installation

1. Clone or download the repository
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

To start the application, run:

```bash
python -m src.cli.app
```

The application will present a menu with the following options:
1. Create Task
2. View All Tasks
3. Update Task
4. Delete Task
5. Filter Tasks
6. Sort Tasks
7. Search Tasks
8. Quit

### Creating a Task
- Select "Create Task" from the menu
- Enter the task title (required)
- Optionally enter a description
- Select the priority level (Low, Medium, High)

### Viewing Tasks
- Select "View All Tasks" to see all tasks in the system
- Tasks are displayed with status icons, priority indicators, and titles

### Updating a Task
- Select "Update Task" from the menu
- Enter the task ID you wish to update
- Follow the prompts to update title, description, status, or priority

### Deleting a Task
- Select "Delete Task" from the menu
- Enter the task ID you wish to delete
- Confirm the deletion when prompted

## Architecture

The application follows a layered architecture:

- **Data Layer** (`src/models/`): Task entity definition
- **Logic Layer** (`src/services/`): Task management logic
- **UI Layer** (`src/cli/`): Console interface and user interaction

### Key Components

- `Task`: Represents a single TODO item with ID, title, description, status, priority, and timestamps
- `TaskManager`: Central component for managing all tasks with CRUD operations
- `Renderer`: Handles all console output and UI rendering
- `MenuSystem`: Manages user interaction and menu navigation

## Testing

The application includes comprehensive tests:

- Unit tests for Task and TaskManager components
- Contract tests for API operations
- Integration tests for CLI flow

To run the tests:

```bash
pytest
```

## Design Principles

This application adheres to the following design principles:

- **In-Memory First**: All data is stored in memory only (no persistence)
- **Single Source of Truth**: The TaskManager owns all task data
- **Layered Architecture**: Clear separation between data, logic, and UI layers
- **Visual Discipline**: Clean, readable, and aesthetic CLI output
- **User Clarity**: Clear menu options and feedback messages

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run the test suite (`pytest`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

This project is part of the Speckit Hackathon and is available for educational purposes.