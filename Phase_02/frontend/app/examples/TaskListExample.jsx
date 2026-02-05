'use client';

import React, { useEffect } from 'react';
import { useTaskContext } from '@/context/TaskContext';

const TaskListExample = () => {
  const {
    tasks,
    loading,
    error,
    fetchTasks,
    updateTask,
    deleteTask,
    markTaskComplete,
    toggleTaskCompletion,
    createTask
  } = useTaskContext();

  // Fetch tasks when component mounts
  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateTask = async (taskId, updatedData) => {
    try {
      await updateTask(taskId, updatedData);
      console.log('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        console.log('Task deleted successfully');
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleMarkComplete = async (taskId) => {
    try {
      await markTaskComplete(taskId);
      console.log('Task marked as complete');
    } catch (error) {
      console.error('Error marking task as complete:', error);
    }
  };

  const handleToggleCompletion = async (taskId, currentStatus) => {
    try {
      await toggleTaskCompletion(taskId, currentStatus);
      console.log('Task completion status toggled');
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="task-list-container">
      <h1>Task List (Using Context)</h1>

      {/* Task Creation Example */}
      <button
        onClick={() => createTask({
          title: 'New Task',
          description: 'Sample description',
          priority: 'Medium'
        })}
        className="create-task-btn"
      >
        Create New Task
      </button>

      {/* Task List */}
      <div className="task-list">
        {tasks.map(task => (
          <div key={task.id} className="task-item">
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Priority: {task.priority}</p>
            <p>Status: {task.status}</p>
            <p>Completed: {task.is_completed ? 'Yes' : 'No'}</p>

            {/* Task Action Buttons */}
            <div className="task-actions">
              <button
                onClick={() => handleUpdateTask(task.id, {
                  ...task,
                  title: task.title + ' (Updated)'
                })}
                className="update-btn"
              >
                Update Task
              </button>

              <button
                onClick={() => handleMarkComplete(task.id)}
                className="complete-btn"
                disabled={task.is_completed}
              >
                Mark Complete
              </button>

              <button
                onClick={() => handleToggleCompletion(task.id, task.is_completed)}
                className="toggle-btn"
              >
                Toggle Completion
              </button>

              <button
                onClick={() => handleDeleteTask(task.id)}
                className="delete-btn"
              >
                Delete Task
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskListExample;