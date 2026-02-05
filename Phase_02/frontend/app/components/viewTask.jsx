import { CircleCheckBig } from "lucide-react";
import { useState } from 'react';
import { tasksAPI } from '@/lib/api';
import ConfirmationModal from './confirmationModal';

export default function ViewTask({isActive, setIsActive, task, onTaskUpdated, onTaskDeleted, setShowEditTask, setTaskToEdit}) {

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

    const hideViewTask = () => {
        setIsActive(!isActive)
    }

    // Function to handle task completion
    const handleTaskComplete = async () => {
        if (task) {
            try {
                await tasksAPI.toggleTaskCompletion(task.id, task.is_completed);

                // Call the callback to notify parent component to refresh tasks
                if (onTaskUpdated) {
                    onTaskUpdated();
                }

                // Close the view task modal after completion
                hideViewTask();
            } catch (error) {
                console.error('Error completing task:', error);
                alert('Failed to complete task. Please try again.');
            }
        }
    };

    const confirmTaskComplete = () => {
        showConfirmation(
            'info',
            'Mark Task Complete',
            'Are you sure you want to mark this task as complete?',
            task,
            async () => {
                if (task) {
                    try {
                        await tasksAPI.toggleTaskCompletion(task.id, task.is_completed);

                        // Call the callback to notify parent component to refresh tasks
                        if (onTaskUpdated) {
                            onTaskUpdated();
                        }

                        // Close the view task modal after completion
                        hideViewTask();
                    } catch (error) {
                        console.error('Error completing task:', error);
                        alert('Failed to complete task. Please try again.');
                    }
                }
            },
            'Mark Complete',
            'Cancel'
        );
    };

    // Function to handle task deletion
    const handleTaskDelete = async () => {
        if (task) {
            try {
                await tasksAPI.deleteTask(task.id);

                // Call the callback to notify parent component to refresh tasks
                if (onTaskDeleted) {
                    onTaskDeleted();
                }

                // Close the view task modal after deletion
                hideViewTask();
            } catch (error) {
                console.error('Error deleting task:', error);
                alert('Failed to delete task. Please try again.');
            }
        }
    };

    const confirmTaskDelete = () => {
        showConfirmation(
            'danger',
            'Delete Task',
            'Are you sure you want to delete this task?',
            task,
            handleTaskDelete,
            'Delete',
            'Cancel'
        );
    };

    // Function to handle task update (open the edit form)
    const handleTaskUpdate = () => {
        // Pass the task data to the parent component to open the edit form
        if (setShowEditTask && setTaskToEdit && task) {
            setTaskToEdit(task); // Pass the task to edit to parent state
            setShowEditTask(true); // Open the edit form
        }
        // Close the view task modal
        hideViewTask();
    };

    // Define helper function to get status color
    const getStatusColor = (status) => {
      switch(status?.toLowerCase()) {
        case 'completed':
          return 'text-green-600'; // Green for completed
        case 'in progress':
          return 'text-blue-600'; // Blue for in progress
        case 'not started':
          return 'text-red-600'; // Red for not started
        default:
          return 'text-gray-600'; // Default gray
      }
    };

    // Define helper function to get priority color
    const getPriorityColor = (priority) => {
      switch(priority?.toLowerCase()) {
        case 'high':
          return 'text-red-600'; // Red for high priority
        case 'moderate':
          return 'text-blue-600'; // Blue for moderate priority
        case 'low':
          return 'text-green-600'; // Green for low priority
        default:
          return 'text-gray-600'; // Default gray
      }
    };

  return (
    <div className={` ${isActive ? "block" : "hidden"} text-[1vw] bg-[#00000063]  fixed top-0 left-0 w-full min-h-screen flex justify-center items-center py-12 px-4`}>
      <div className="mx-auto max-w-4xl w-full bg-white rounded-2xl shadow-lg p-8 md:p-12 text-[1vw] relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <h1 className="text-[1.6em] font-semibold text-gray-900">
            {task ? task.title : 'Loading...'}
          </h1>
          <span onClick={hideViewTask} className="text-[0.9em] text-blue-600 cursor-pointer hover:underline">
            Go Back
          </span>
        </div>

        {/* Image + Metadata Row */}
        <div className="flex flex-col md:flex-row gap-8 mb-10">

          {/* Metadata */}
          <div className="md:w-2/3 flex flex-col justify-center space-y-3">
            <div className="text-[1em]">
              <span className="font-medium text-gray-700">Priority:</span>{' '}
              <span className={task ? getPriorityColor(task.priority) : 'text-gray-600'}>
                {task ? task.priority || 'Medium' : 'Loading...'}
              </span>
            </div>
            <div className="text-[1em]">
              <span className="font-medium text-gray-700">Status:</span>{' '}
              <span className={task ? getStatusColor(task.status) : 'text-gray-600'}>
                {task ? task.status || 'Not Started' : 'Loading...'}
              </span>
            </div>
            <div className="text-[0.9em] text-gray-500">
              Created on: {task ? task.createdDate || 'Unknown' : 'Loading...'}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-[1em] leading-[1.6em] text-gray-800 mb-10">
          {task ? task.description || 'No description provided.' : 'Loading...'}
        </p>

        {/* Checklist - Using a placeholder for now, as actual checklist data may not exist in task object
        <ol className="list-decimal pl-8 space-y-3 mb-10 text-[0.95em] text-gray-700">
          <li>This is a sample checklist item.</li>
          <li>Actual checklist items would come from the task data.</li>
          <li>Placeholder for demonstration purposes.</li>
        </ol> */}

        {/* Floating Action Buttons (Bottom Right) */}
        <div className="absolute bottom-6 right-6 flex gap-4">
          {/* Task Deleted - Delete button */}
          <button
            onClick={confirmTaskDelete}
            className="bg-red-600 hover:bg-red-700 text-white w-12 h-12 rounded-lg flex items-center justify-center shadow-md transition"
            title="Delete Task"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>

          {/* Task Updated - Edit button */}
          <button
            onClick={handleTaskUpdate}
            className="bg-yellow-600 hover:bg-yellow-700 text-white w-12 h-12 rounded-lg flex items-center justify-center shadow-md transition"
            title="Update Task"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          {/* Task Completed - Complete button */}
          <button
            onClick={confirmTaskComplete}
            className="bg-green-600 hover:bg-green-700 text-white w-12 h-12 rounded-lg flex items-center justify-center shadow-md transition"
            title="Complete Task"
          >
            <CircleCheckBig className="w-7 h-7" />
          </button>
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={hideConfirmation}
          onConfirm={() => {
            confirmationModal.onConfirm();
            hideConfirmation();
          }}
          title={confirmationModal.title}
          message={confirmationModal.message}
          taskDetails={confirmationModal.taskDetails}
          confirmButtonText={confirmationModal.confirmButtonText}
          cancelButtonText={confirmationModal.cancelButtonText}
          type={confirmationModal.type}
        />
      </div>
    </div>
  );
}