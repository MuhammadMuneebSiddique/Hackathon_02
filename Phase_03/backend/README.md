# Backend - Multi-User Web TODO Application

This is the backend component of the multi-user web-based TODO application with JWT authentication and data isolation.

## Architecture
- **Framework**: FastAPI (Python)
- **ORM**: SQLModel
- **Authentication**: JWT-based with shared BETTER_AUTH_SECRET
- **Database**: Neon Serverless PostgreSQL

## Features
- User registration and authentication
- Task CRUD operations with user isolation
- JWT-based session management
- Data validation and security

## Documentation Links
- [Specification](../specs/001-todo-app-auth/spec.md)
- [Implementation Plan](../specs/001-todo-app-auth/plan.md)
- [Data Model](../specs/001-todo-app-auth/data-model.md)
- [Research Summary](../specs/001-todo-app-auth/research.md)
- [Quickstart Guide](../specs/001-todo-app-auth/quickstart.md)

## Project Structure
```
backend/
├── main.py                 # FastAPI application entry point
├── pyproject.toml          # Python dependencies
├── uv.lock                 # Lock file for dependencies
├── .python-version         # Python version specification
├── .venv                   # Virtual environment
└── src/
    ├── auth/               # Authentication utilities
    ├── models/             # SQLModel definitions
    ├── routes/             # API route handlers
    ├── schemas/            # Pydantic schemas for validation
    ├── services/           # Business logic services
    └── utils/              # Utility functions
```

## Setup
1. Ensure you have Python 3.10+ installed
2. Install dependencies: `uv sync` (if using uv) or `pip install -r requirements.txt`
3. Set up environment variables in `.env`:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database_name
   BETTER_AUTH_SECRET=your-super-secret-jwt-key-here
   ```
4. Run the application: `uv run main.py` or `python -m uvicorn main:app --reload`

## API Documentation
Once running, visit `http://localhost:8000/docs` for interactive API documentation.