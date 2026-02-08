# Quickstart Guide: Multi-User Web TODO Application

**Feature**: 001-todo-app-auth
**Date**: 2026-01-07

## Overview

This guide provides step-by-step instructions to set up and run the multi-user web-based TODO application with JWT authentication and data isolation.

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.10 or higher)
- PostgreSQL-compatible database (Neon Serverless PostgreSQL recommended)
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Backend Setup (FastAPI)

#### Navigate to backend directory
```bash
cd backend
```

#### Create virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Install dependencies
```bash
pip install fastapi uvicorn sqlmodel pydantic python-multipart python-jose[cryptography] passlib[bcrypt] python-dotenv
```

#### Set up environment variables
Create a `.env` file in the backend directory:
```env
DATABASE_URL=postgresql://username:password@host:port/database_name
BETTER_AUTH_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours in minutes
```

#### Initialize database
```bash
# Run database migrations to create tables
python -c "
from database import create_db_and_tables
create_db_and_tables()
"
```

#### Run the backend server
```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup (Next.js)

#### Navigate to frontend directory
```bash
cd ../frontend
```

#### Install dependencies
```bash
npm install
```

#### Set up environment variables
Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
BETTER_AUTH_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
```

#### Run the frontend development server
```bash
npm run dev
```

## Project Structure

```
project-root/
├── backend/
│   ├── main.py          # FastAPI application entry point
│   ├── database.py      # Database connection and initialization
│   ├── models/          # SQLModel definitions
│   │   ├── user.py      # User model
│   │   └── task.py      # Task model
│   ├── schemas/         # Pydantic schemas for validation
│   │   ├── user.py      # User schemas
│   │   └── task.py      # Task schemas
│   ├── routes/          # API route handlers
│   │   ├── auth.py      # Authentication endpoints
│   │   └── tasks.py     # Task endpoints
│   ├── auth/            # Authentication utilities
│   │   └── jwt.py       # JWT utilities
│   └── requirements.txt # Python dependencies
├── frontend/
│   ├── app/             # Next.js App Router pages
│   │   ├── login/       # Login page
│   │   ├── register/    # Registration page
│   │   ├── dashboard/   # Dashboard with task list
│   │   └── globals.css  # Global styles
│   ├── components/      # Reusable React components
│   │   ├── TaskItem/    # Component for individual tasks
│   │   ├── TaskForm/    # Form for creating/updating tasks
│   │   └── AuthGuard/   # Component for protecting routes
│   ├── lib/             # Utility functions
│   │   └── api.js       # API client
│   └── package.json     # Node.js dependencies
└── specs/               # Specification files
    └── 001-todo-app-auth/
        ├── spec.md      # Feature specification
        ├── plan.md      # Implementation plan
        ├── research.md  # Research summary
        ├── data-model.md # Data model
        └── contracts/   # API contracts
            └── api-contract.yaml
```

## Key Configuration Points

### Backend Configuration

1. **Database Connection**: Ensure `DATABASE_URL` in `.env` points to your PostgreSQL instance
2. **JWT Secret**: Use a strong random string for `BETTER_AUTH_SECRET`
3. **Token Expiration**: Set `ACCESS_TOKEN_EXPIRE_MINUTES` to 1440 for 24-hour tokens

### Frontend Configuration

1. **API Base URL**: Set `NEXT_PUBLIC_API_BASE_URL` to match your backend URL
2. **Auth Configuration**: Ensure `BETTER_AUTH_SECRET` matches backend for JWT validation

## Running Tests

### Backend Tests
```bash
cd backend
python -m pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

## Troubleshooting

### Common Issues

1. **Database Connection Errors**: Verify `DATABASE_URL` is correct and database is accessible
2. **JWT Validation Failures**: Ensure `BETTER_AUTH_SECRET` matches between frontend and backend
3. **CORS Issues**: Configure CORS middleware in FastAPI to allow frontend origin

### Environment Variables

Make sure all required environment variables are set in both frontend and backend:
- Backend: `DATABASE_URL`, `BETTER_AUTH_SECRET`
- Frontend: `NEXT_PUBLIC_API_BASE_URL`, `BETTER_AUTH_SECRET`

## Next Steps

1. Implement the backend API endpoints according to the contract
2. Set up database models and relationships
3. Implement authentication middleware
4. Create frontend components for user interface
5. Connect frontend to backend API
6. Test user isolation and security requirements