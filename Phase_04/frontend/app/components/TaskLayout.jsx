'use client';

import { useState, useEffect } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { Circle, CircleCheckBig } from 'lucide-react';
import AddNewTask from './taskForm'; // Import the existing TaskForm component
import ConfirmationModal from './confirmationModal'; // Import the dashboard's confirmation modal

export default function TaskLayout({ taskCategory, title, taskFilter }) {
  const { tasks, loading, error, fetchTasks, deleteTask, updateTask, markTaskComplete } = useTaskContext();
  const [selectedTask, setSelectedTask] = useState(null);

  // Confirmation modal state (same as dashboard)
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

  // Editing states
  const [isEditing, setIsEditing] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Apply filter based on category
  const filteredTasks = taskFilter ? tasks.filter(taskFilter) : tasks;

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high':
        return '#42ADE2'; // Blue for high priority (as per requirements)
      case 'extreme':
        return '#F21E1E'; // Red for extreme priority (as per requirements)
      case 'low':
        return '#22c55e'; // Green for low priority (as per requirements)
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

  // Show confirmation modal (same as dashboard)
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

  // Hide confirmation modal (same as dashboard)
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

  // Handle delete task
  const handleDeleteTask = async () => {
    if (selectedTask) {
      try {
        await deleteTask(selectedTask.id);
        setSelectedTask(null); // Clear selection after deletion
        hideConfirmation();
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  // Handle complete task
  const handleCompleteTask = async () => {
    if (selectedTask) {
      try {
        const updatedTask = await markTaskComplete(selectedTask.id);
        setSelectedTask(updatedTask);
        hideConfirmation();
      } catch (error) {
        console.error('Error completing task:', error);
        alert('Failed to complete task. Please try again.');
      }
    }
  };

  // Handle update task - called from the task form
  const handleUpdateTask = async (updatedTask) => {
    try {
      // The updateTask function from context will update the task in the backend and state
      const result = await updateTask(selectedTask.id, updatedTask);

      // Update the selected task in the UI
      setSelectedTask(result);
      setIsEditing(false);
      setTaskToEdit(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Open edit mode with current task data
  const openEditMode = () => {
    if (selectedTask) {
      setTaskToEdit(selectedTask);
      setIsEditing(true);
    }
  };

  // Confirm delete task (same as dashboard)
  const confirmTaskDelete = () => {
    showConfirmation(
      'danger',
      'Delete Task',
      'Are you sure you want to delete this task?',
      selectedTask,
      handleDeleteTask,
      'Delete',
      'Cancel'
    );
  };

  // Confirm complete task (same as dashboard)
  const confirmTaskComplete = () => {
    showConfirmation(
      'info',
      'Mark Task Complete',
      'Are you sure you want to mark this task as complete?',
      selectedTask,
      handleCompleteTask,
      'Mark Complete',
      'Cancel'
    );
  };

  return (
    <div className="h-screen sm:h-full bg-zinc-50 p-[2vw] text-[1vw] font-sans text-slate-800">
      <div className="grid grid-cols-1 grid-rows-[1.5fr_1fr] md:grid-rows-1 h-full md:grid-cols-[1.5fr_2fr] gap-[2vw]">

        {/* LEFT COLUMN — TASK LIST PANEL */}
        <section className="bg-white rounded-[1.5em] h-full overflow-y-scroll p-[2vw] shadow-sm border border-slate-100">
          <h2 className="text-[1.2em] font-semibold mb-[1vw]">{title}</h2>

          <div className="space-y-[1vw]">
            {loading ? (
              <div className="text-center py-[2vw] text-gray-500">Loading tasks...</div>
            ) : error ? (
              <div className="text-center py-[2vw] text-red-500">Error: {error}</div>
            ) : filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="flex cursor-pointer gap-[1em] items-start border border-[#A1A3AB] rounded-[1em] p-[1vw] mb-[1vw] last:mb-0 hover:bg-gray-50 transition-colors"
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
              ))
            ) : (
              <div className="text-center py-[2vw] text-gray-500">No tasks found.</div>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN — TASK DETAILS PANEL (same as dashboard) */}
        <section className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-[1vw] relative">
          {selectedTask ? (
            <div>
              {/* Header */}
              <div className="flex justify-between items-start mb-10">
                <h1 className="text-[1.6em] font-semibold text-gray-900">
                  {selectedTask.title}
                </h1>
                <span className="text-[0.9em] text-blue-600 cursor-pointer hover:underline">
                  Go Back
                </span>
              </div>

              {/* Image + Metadata Row */}
              <div className="flex flex-col md:flex-row gap-8 mb-10">
                {/* Metadata */}
                <div className="md:w-2/3 flex flex-col justify-center space-y-3">
                  <div className="text-[1em]">
                    <span className="font-medium text-gray-700">Priority:</span>{' '}
                    <span style={{color: getPriorityColor(selectedTask.priority)}}>
                      {selectedTask.priority || 'Medium'}
                    </span>
                  </div>
                  <div className="text-[1em]">
                    <span className="font-medium text-gray-700">Status:</span>{' '}
                    <span style={{color: getStatusColor(selectedTask.status)}}>
                      {selectedTask.status || 'Not Started'}
                    </span>
                  </div>
                  <div className="text-[0.9em] text-gray-500">
                    Created on: {selectedTask.createdDate || 'Unknown'}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-[1em] leading-[1.6em] text-gray-800 mb-10">
                {selectedTask.description || 'No description provided.'}
              </p>

              {/* Floating Action Buttons (Bottom Right) - same as dashboard */}
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
                  onClick={openEditMode}
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
                {!selectedTask.is_completed && selectedTask.status?.toLowerCase() !== 'completed' && (
                  <button
                    onClick={confirmTaskComplete}
                    className="bg-green-600 hover:bg-green-700 text-white w-12 h-12 rounded-lg flex items-center justify-center shadow-md transition"
                    title="Complete Task"
                  >
                    <CircleCheckBig className="w-7 h-7" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 py-[4vw]">
              Select a task to view details
            </div>
          )}
        </section>
      </div>

      {/* Confirmation Modal (same as dashboard) */}
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

      {/* Task Form for Editing */}
      {isEditing && taskToEdit && (
        <AddNewTask
          isActive={true}
          setIsActive={(state) => {
            setIsEditing(state);
            if (!state) {
              setTaskToEdit(null);
            }
          }}
          onTaskCreated={handleUpdateTask}
          taskToEdit={taskToEdit}
        />
      )}
    </div>
  );
}