'use client';

import { useState, useEffect } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import AddNewTask from './taskForm';
import ConfirmationModal from './confirmationModal';
import { Circle } from 'lucide-react';

export default function SharedTaskList({ taskCategory, title, taskFilter, onViewTask, onTaskSelected, onNavigateToTasks }) {
  const { tasks, loading, error, fetchTasks } = useTaskContext();
  const [selectedTask, setSelectedTask] = useState(null);

  // State for modals
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: '',
    title: '',
    message: '',
    taskDetails: null,
    onConfirm: null,
    confirmButtonText: 'Yes',
    cancelButtonText: 'Cancel'
  });

  const showConfirmation = (type, title, message, taskDetails, onConfirm, confirmButtonText = 'Yes', cancelButtonText = 'Cancel') => {
    setConfirmationModal({
      isOpen: true,
      type,
      title,
      message,
      taskDetails,
      onConfirm,
      confirmButtonText,
      cancelButtonText
    });
  };

  const hideConfirmation = () => {
    setConfirmationModal({
      isOpen: false,
      type: '',
      title: '',
      message: '',
      taskDetails: null,
      onConfirm: null,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel'
    });
  };

  // Apply filter based on category
  const filteredTasks = taskFilter ? tasks.filter(taskFilter) : tasks;

  // Get priority color
  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high':
        return '#42ADE2'; // Blue for high priority (as per requirements)
      case 'extreme':
        return '#F21E1E'; // Red for extreme priority (as per requirements)
      case 'low':
        return 'yellow'; // Yellow for low priority (as per requirements)
      default:
        return '#A1A3AB'; // Default gray
    }
  };

  // Get status color
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
    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
      {loading ? (
        <div className="text-center py-[2vw] text-gray-500">Loading tasks...</div>
      ) : error ? (
        <div className="text-center py-[2vw] text-red-500">Error: {error}</div>
      ) : filteredTasks.length > 0 ? (
        <>
          {filteredTasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              onClick={() => {
                setSelectedTask(task);
                onTaskSelected(task);
                onViewTask();
              }}
              className="flex cursor-pointer gap-[1em] items-start sm:border border-[#A1A3AB] rounded-[1em] p-[1vw] mb-[1vw] last:mb-0"
            >
              <Circle className='w-[1.4em]  mt-[0.5em] h-[1.4em]' style={{color: task.is_completed ? '#05A301' : getPriorityColor(task.priority)}} />
              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-[1.4em] font-medium truncate">{task.title}</h3>
                <p className="text-[1em] text-gray-500 mt-1 line-clamp-2">
                  {task.description?.slice(0,50)}...
                </p>
                <div className="flex flex-col  gap-[0.2em] mt-[0.5vw] text-[1em] text-black">
                  <span>Priority: <span className="font-medium" style={{color: getPriorityColor(task.priority)}}>{task.priority}</span></span>
                  <span>Status: <span className='font-medium' style={{color: getStatusColor(task.status)}}>{task.status}</span></span>
                  <span>Created on: {task.createdDate || 'Unknown'}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredTasks.length > 3 && (
            <div className="text-center">
              <button
                onClick={onNavigateToTasks}
                className="text-[1em] text-[#ff6f6f] font-medium cursor-pointer hover:underline"
              >
                View More
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-[2vw] text-gray-500">No tasks found.</div>
      )}
    </div>
  );
}