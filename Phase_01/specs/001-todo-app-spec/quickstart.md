# Quickstart Guide: In-Memory Python Console TODO Application

## Prerequisites
- Python 3.11 or higher
- pip package manager

## Setup

1. Clone or create the project directory structure:
```
todo-app/
├── src/
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py
│   ├── services/
│   │   ├── __init__.py
│   │   └── task_manager.py
│   ├── cli/
│   │   ├── __init__.py
│   │   ├── renderer.py
│   │   ├── menu.py
│   │   └── app.py
│   └── lib/
│       ├── __init__.py
│       └── utils.py
├── tests/
│   ├── unit/
│   ├── integration/
│   └── contract/
└── requirements.txt
```

2. Install dependencies:
```bash
pip install colorama pytest
```

3. Create requirements.txt:
```
colorama==0.4.6
pytest==7.4.3
```

## Running the Application

1. Navigate to the project root directory
2. Run the application:
```bash
python -m src.cli.app
```

## Basic Usage

1. The application starts with a main menu showing available options
2. Select options using numbered menu choices
3. Follow prompts to enter task information
4. Use 'q' or 'quit' to exit the application at any menu

## Example Workflow

1. Start the application
2. Select "Create Task" to add a new task
3. Enter task title and description when prompted
4. Select "View Tasks" to see all tasks
5. Use "Update Task" to modify existing tasks
6. Use "Delete Task" to remove completed tasks

## Testing

Run all tests:
```bash
pytest
```

Run specific test directory:
```bash
pytest tests/unit/
```

## Development

The application follows a layered architecture:
- Data layer: `src/models/` - Task entity definitions
- Logic layer: `src/services/` - Business logic and task management
- UI layer: `src/cli/` - Console interface and user interaction

Each layer has clear boundaries and dependencies flow in one direction: UI → Logic → Data.