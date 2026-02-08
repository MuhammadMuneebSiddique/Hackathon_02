# Data Model: Multi-User Web TODO Application

**Feature**: 001-todo-app-auth
**Date**: 2026-01-07

## Overview

This document defines the data model for the multi-user web-based TODO application, including entity definitions, relationships, and constraints.

## Entity Definitions

### User Entity

**Description**: Represents an authenticated user of the system

**Fields**:
- `id` (String, Primary Key)
  - Type: String (UUID format)
  - Constraints: Required, Unique
  - Description: Unique identifier for the user

- `email` (String)
  - Type: String (VARCHAR 255)
  - Constraints: Required, Unique
  - Description: User's email address for identification and communication

- `password` (String)
  - Type: String (VARCHAR 255)
  - Constraints: Required
  - Description: Encrypted password with minimum 8 characters including uppercase, lowercase, number, and special character

- `created_at` (DateTime)
  - Type: DateTime (Timestamp)
  - Constraints: Required, Auto-generated
  - Description: Timestamp of user account creation

- `updated_at` (DateTime)
  - Type: DateTime (Timestamp)
  - Constraints: Required, Auto-generated
  - Description: Timestamp of last user account update

**Validation Rules**:
- Email must be valid email format
- Password must meet security requirements (8+ chars, upper, lower, number, special)
- Account activates immediately upon registration (no verification required)

### Task Entity

**Description**: Represents a personal task owned by a single user

**Fields**:
- `id` (Integer, Primary Key)
  - Type: Integer (Auto-increment)
  - Constraints: Required, Unique, Auto-generated
  - Description: Unique identifier for the task

- `user_id` (String, Foreign Key)
  - Type: String (UUID format)
  - Constraints: Required, Foreign Key to users.id
  - Description: Reference to the user who owns this task

- `title` (String)
  - Type: String (VARCHAR 100)
  - Constraints: Required, Max 100 characters
  - Description: Title of the task

- `description` (Text)
  - Type: Text (Optional)
  - Constraints: Optional, Max 1000 characters
  - Description: Detailed description of the task

- `is_completed` (Boolean)
  - Type: Boolean
  - Constraints: Required, Default: False
  - Description: Completion status of the task

- `created_at` (DateTime)
  - Type: DateTime (Timestamp)
  - Constraints: Required, Auto-generated
  - Description: Timestamp of task creation

- `updated_at` (DateTime)
  - Type: DateTime (Timestamp)
  - Constraints: Required, Auto-generated
  - Description: Timestamp of last task update

**Validation Rules**:
- Every task must have a valid user_id that references an existing user
- Title is required and limited to 100 characters
- Description is optional and limited to 1000 characters
- is_completed defaults to false
- All timestamps are auto-generated

## Relationships

### User to Tasks (One-to-Many)
- One User can own many Tasks
- Foreign key constraint: tasks.user_id references users.id
- Cascade delete: When a user is deleted, all their tasks are also deleted
- Required for data isolation enforcement

## Database Schema

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

## Constraints & Indexes

### Constraints
- `users.email`: UNIQUE constraint to prevent duplicate registrations
- `tasks.user_id`: FOREIGN KEY constraint to ensure referential integrity
- `tasks.title`: NOT NULL constraint to ensure all tasks have a title
- `tasks.user_id`: NOT NULL constraint to ensure every task is owned by a user

### Indexes
- `idx_tasks_user_id`: Index on user_id for efficient filtering by user in queries
- Primary keys automatically indexed by database

## Security Considerations

### Data Isolation
- All task queries must include a WHERE clause filtering by user_id
- Foreign key constraint ensures no orphaned tasks exist
- Cascade delete ensures data cleanup when users are removed

### Access Control
- User authentication required before any data access
- JWT validation ensures requests come from authenticated users
- User ID extracted from JWT must match resource owner