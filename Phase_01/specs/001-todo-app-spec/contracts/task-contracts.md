# API Contracts: In-Memory Python Console TODO Application

## Task Management Contracts

### Create Task
- **Input**: title (string, required), description (string, optional), priority (enum: low/medium/high, default: medium)
- **Output**: Task object with all attributes including auto-generated id and timestamps
- **Side effects**: New task added to the task collection
- **Validation**: Title must not be empty
- **Error cases**: Invalid priority value, empty title

### Get All Tasks
- **Input**: None
- **Output**: Array of Task objects
- **Side effects**: None
- **Validation**: None
- **Error cases**: None

### Get Task by ID
- **Input**: task_id (integer, required)
- **Output**: Single Task object or null if not found
- **Side effects**: None
- **Validation**: task_id must be positive integer
- **Error cases**: Task not found

### Update Task
- **Input**: task_id (integer, required), fields to update (title, description, status, priority)
- **Output**: Updated Task object
- **Side effects**: Task modified in collection
- **Validation**: task_id must exist, status/priority must be valid
- **Error cases**: Task not found, invalid status transition

### Delete Task
- **Input**: task_id (integer, required)
- **Output**: Boolean indicating success
- **Side effects**: Task removed from collection
- **Validation**: task_id must exist
- **Error cases**: Task not found

### Filter Tasks
- **Input**: filter criteria (status, priority, date range)
- **Output**: Array of Task objects matching criteria
- **Side effects**: None
- **Validation**: Filter parameters must be valid
- **Error cases**: Invalid filter criteria

### Sort Tasks
- **Input**: sort criteria (priority, status, creation date, etc.)
- **Output**: Array of Task objects in sorted order
- **Side effects**: None
- **Validation**: Sort parameters must be valid
- **Error cases**: Invalid sort criteria