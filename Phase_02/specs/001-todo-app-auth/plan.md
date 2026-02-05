# Implementation Plan: Multi-User Web TODO Application

**Feature Branch**: `001-todo-app-auth`
**Created**: 2026-01-07
**Status**: Draft
**Input**: User description: "Multi-user web-based TODO application with JWT authentication, data isolation, and CRUD operations for tasks."

## Technical Context

The system will be implemented as a decoupled architecture with:
- **Frontend**: Next.js 16+ (App Router), TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python), SQLModel (ORM), Pydantic v2
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: Better Auth (Frontend) with JWT verification via shared BETTER_AUTH_SECRET (Backend)
- **API Style**: Strictly RESTful, using JSON for all exchanges

**Key Technical Decisions**:
- User Isolation: Every database query must include a filter for user_id
- Stateless Backend: Using JWTs for session validation
- Separation of Concerns: Frontend and backend directories completely decoupled
- Validation: All incoming data validated using Pydantic schemas

## Constitution Check

This plan adheres to all principles in the Multi-User Web TODO Constitution:

✅ **Spec-Driven Development**: Following strict Spec → Plan → Task → Implement cycle
✅ **Technical Commandments**: Using prescribed stack (Next.js, FastAPI, SQLModel, Neon PostgreSQL, Better Auth)
✅ **Security & Multi-Tenancy**: Enforcing user isolation and stateless backend with JWTs
✅ **Architectural Rules**: Maintaining separation of concerns between frontend/backend
✅ **Coding Standards**: Prioritizing readability and type safety

**Gates**:
- [x] Specification is locked as source of truth
- [x] Architecture aligns with prescribed technology stack
- [x] Security requirements met (user isolation, JWT validation)
- [x] Decoupled architecture maintained

## Phase 0: Research & Unknown Resolution

### Research Summary

#### Technology Choices Resolved

**Decision**: Use Better Auth for frontend authentication and JWT verification on backend
**Rationale**: Aligns with constitution requirements and provides robust authentication with session management
**Alternatives considered**: NextAuth.js, Clerk, Auth0 - Better Auth chosen for its simplicity and JWT capabilities

**Decision**: Implement single session per user with JWT invalidation
**Rationale**: Meets specification requirement for enhanced security by restricting to one session
**Alternatives considered**: Multiple concurrent sessions - rejected per specification

**Decision**: Use SQLModel ORM for database operations
**Rationale**: Integrates well with FastAPI and provides type safety with Pydantic models
**Alternatives considered**: SQLAlchemy Core, Tortoise ORM - SQLModel chosen for Pydantic compatibility

**Decision**: Implement character limits for task titles (100) and descriptions (1000)
**Rationale**: Meets specification requirements for data validation and UI consistency
**Alternatives considered**: Unlimited fields - rejected per specification

## Phase 1: Design & Contracts

### Data Model Design

#### User Entity
- **id**: String (Primary Key, Unique)
- **email**: String (Unique, Required)
- **password**: String (Encrypted, Required with 8+ chars, upper, lower, number, special char)
- **created_at**: DateTime (Auto-generated)
- **updated_at**: DateTime (Auto-generated)

#### Task Entity
- **id**: Integer (Primary Key, Auto-increment)
- **user_id**: String (Foreign Key to users.id, Required for isolation)
- **title**: String (Required, Max 100 characters)
- **description**: Text (Optional, Max 1000 characters)
- **is_completed**: Boolean (Default: False)
- **created_at**: DateTime (Auto-generated)
- **updated_at**: DateTime (Auto-generated)

#### Relationships
- One User to Many Tasks (One-to-Many)
- Foreign key constraint ensures referential integrity
- All task queries must filter by user_id for isolation

### API Contract Design

#### Global API Rules
- Base URL: `/api/v1`
- Authentication: `Authorization: Bearer <JWT_TOKEN>` header required for all protected endpoints
- Request/Response Format: JSON
- Error Handling: Standard HTTP status codes

#### Task API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/tasks` | Returns all tasks for the authenticated user | Yes |
| POST | `/api/v1/tasks` | Creates a new task | Yes |
| GET | `/api/v1/tasks/{id}` | Fetches a specific task if it belongs to the user | Yes |
| PUT | `/api/v1/tasks/{id}` | Updates task content | Yes |
| DELETE | `/api/v1/tasks/{id}` | Deletes the task | Yes |
| PATCH | `/api/v1/tasks/{id}/toggle` | Flips the is_completed status | Yes |

#### User API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user account | No |
| POST | `/api/v1/auth/login` | Authenticate user and return JWT | No |
| POST | `/api/v1/auth/logout` | Invalidate current session | Yes |

#### Request/Response Examples

**Create Task Request**:
```json
{
  "title": "Sample task title",
  "description": "Optional description of the task",
  "is_completed": false
}
```

**Create Task Response** (201 Created):
```json
{
  "id": 1,
  "user_id": "user-uuid",
  "title": "Sample task title",
  "description": "Optional description of the task",
  "is_completed": false,
  "created_at": "2026-01-07T10:00:00Z",
  "updated_at": "2026-01-07T10:00:00Z"
}
```

### Database Schema

```sql
-- Users table (managed primarily by Better Auth)
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance on user_id for isolation
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

### Authentication Flow Design

1. **Registration Flow**:
   - User provides email and password (validates 8+ chars with upper/lower/number/special)
   - Account activates immediately (no email verification)
   - System stores encrypted password
   - Returns success response

2. **Login Flow**:
   - User provides email and password
   - System verifies credentials
   - Generates JWT with 24-hour expiration
   - Returns JWT token
   - Previous session invalidated (single session requirement)

3. **Protected Route Flow**:
   - Client sends JWT in Authorization header
   - Backend verifies JWT signature using BETTER_AUTH_SECRET
   - Extracts user_id from JWT payload
   - Validates user_id matches requested resource
   - Proceeds with request or returns 401 Unauthorized

## Phase 2: Implementation Strategy

### Implementation Order

1. **Database Setup**:
   - Configure Neon PostgreSQL connection
   - Create database schema with proper indexes
   - Set up SQLModel models

2. **Backend Services**:
   - Implement JWT authentication service
   - Create user management endpoints
   - Develop task CRUD operations with user isolation
   - Add validation layers using Pydantic

3. **Frontend Components**:
   - Set up Next.js project with App Router
   - Integrate Better Auth for authentication
   - Create task management UI components
   - Implement API communication layer

4. **Integration & Testing**:
   - Connect frontend to backend APIs
   - Test user isolation functionality
   - Validate security requirements
   - Conduct end-to-end testing

### Security Measures

- **Input Validation**: All data validated using Pydantic schemas
- **User Isolation**: Every query filtered by user_id from JWT
- **SQL Injection Prevention**: ORM usage prevents injection attacks
- **Password Security**: Encrypted passwords with proper hashing
- **JWT Security**: Proper secret management and token validation

### Quickstart Guide

1. Clone the repository
2. Set up environment variables:
   - `DATABASE_URL`: Neon PostgreSQL connection string
   - `BETTER_AUTH_SECRET`: Shared secret for JWT validation
   - `NEXT_PUBLIC_BETTER_AUTH_URL`: Frontend auth URL
3. Run database migrations
4. Start backend and frontend services
5. Access the application at http://localhost:3000

## Phase 3: Risk Assessment

### High-Risk Areas

1. **Single Session Management**: Complex to implement with JWTs
2. **User Isolation**: Critical for security, requires careful query validation
3. **JWT Expiration**: Need to handle token refresh and invalidation properly

### Mitigation Strategies

1. **Thorough Testing**: Comprehensive test suite for user isolation
2. **Code Reviews**: Peer reviews for security-sensitive code
3. **Monitoring**: Log all authentication attempts and data access patterns

## Next Steps

1. Generate detailed tasks using `/sp.tasks`
2. Begin backend implementation focusing on authentication
3. Develop database models and validation schemas
4. Create API endpoints with proper security controls