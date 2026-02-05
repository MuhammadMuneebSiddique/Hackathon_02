'use client';

import React from 'react';
import { useTaskContext } from '@/context/TaskContext';

const TaskCardExample = ({ task }) => {
  const { updateTask, deleteTask, markTaskComplete } = useTaskContext();

  const handleUpdatePriority = async (newPriority) => {
    try {
      await updateTask(task.id, { ...task, priority: newPriority });
      console.log(`Task priority updated to ${newPriority}`);
    } catch (error) {
      console.error('Error updating task priority:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
      console.log('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleMarkAsComplete = async () => {
    try {
      await markTaskComplete(task.id);
      console.log('Task marked as complete');
    } catch (error) {
      console.error('Error marking task as complete:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high':
        return '#42ADE2'; // Blue for high priority
      case 'extreme':
        return '#F21E1E'; // Red for extreme priority
      case 'low':
        return 'yellow'; // Yellow for low priority
      default:
        return '#A1A3AB'; // Default gray
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return '#05A301'; // Green for completed
      case 'in progress':
        return '#0225FF'; // Blue for in progress
      case 'not started':
        return '#F21E1E'; // Red for not started
      default:
        return '#A1A3AB'; // Default gray
    }
  };

  return (
    <div className="task-card bg-white border border-[#A1A3AB] rounded-xl p-[1em] flex gap-[0.7em] items-start">
      {/* Status Dot - Circle indicator */}
      <div
        className="w-[1.4em] h-[1.4em] rounded-full mt-[0.5em]"
        style={{ backgroundColor: task.is_completed ? '#05A301' : getPriorityColor(task.priority) }}
      />

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[1.4em] font-medium truncate">{task.title}</h3>
        <p className="text-[1em] text-gray-500 mt-1 line-clamp-2">
          {task.description?.slice(0, 50)}...
        </p>
        <div className="flex flex-col gap-[0.2em] mt-[0.5vw] text-[1em] text-black">
          <span>
            Priority:
            <span
              className="font-medium"
              style={{ color: getPriorityColor(task.priority) }}
            >
              {task.priority}
            </span>
          </span>
          <span>
            Status:
            <span
              className="font-medium"
              style={{ color: getStatusColor(task.status) }}
            >
              {task.status}
            </span>
          </span>
          <span>Created on: {task.createdDate || 'Unknown'}</span>
        </div>
      </div>

      {/* Task Actions */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => handleUpdatePriority('High')}
          className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded"
        >
          Set High
        </button>
        <button
          onClick={handleMarkAsComplete}
          className="text-xs px-2 py-1 bg-green-100 hover:bg-green-200 rounded"
          disabled={task.is_completed}
        >
          Complete
        </button>
        <button
          onClick={handleDelete}
          className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCardExample;