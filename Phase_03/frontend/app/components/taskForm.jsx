
'use client';
import { useState, useEffect } from 'react';
import { tasksAPI } from "../../util/api"
import ConfirmationModal from './confirmationModal';

export default function AddNewTask({isActive, setIsActive, onTaskCreated, taskToEdit}) {

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '', // Default to low priority
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const hideTaskForm = () => {
    setIsActive(!isActive);
  };

  // Effect to populate form when taskToEdit changes
  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        priority: taskToEdit.priority || '',
      });
    } else {
      // Reset form when not editing
      setFormData({
        title: '',
        description: '',
        priority: '',
      });
    }
  }, [taskToEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRadioChange = (e) => {
    console.log(e.target.value)
    setFormData(prev => ({
      ...prev,
      priority: e.target.value
    }));
  };

  const handleSaveTask = async () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let resultTask;

      if (taskToEdit && taskToEdit.id) {
        // Update existing task
        resultTask = await tasksAPI.updateTask(taskToEdit.id, {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
        });

        // Call the callback to notify parent component that a task was updated
        if (onTaskCreated) {
          onTaskCreated(resultTask); // Passing updated task to refresh the list
        }
      } else {
        // Create new task
        resultTask = await tasksAPI.createTask({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          is_completed: false, // New tasks start as not completed
        });

        // Call the callback to notify parent component
        if (onTaskCreated) {
          onTaskCreated(resultTask);
        }
      }

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        priority: '',
      });

      // Close the form
      setIsActive(false);
    } catch (err) {
      setError(err.message || (taskToEdit && taskToEdit.id ? 'Failed to update task' : 'Failed to create task'));
      console.error(taskToEdit && taskToEdit.id ? 'Error updating task:' : 'Error creating task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (taskToEdit && taskToEdit.id) {
      // Show confirmation for update operation
      showConfirmation(
        'info',
        'Update Task',
        'Are you sure you want to update this task?',
        taskToEdit,
        handleSaveTask,
        'Update Task',
        'Cancel'
      );
    } else {
      // For create operation, proceed directly
      handleSaveTask();
    }
  };
  return (
    <div className={` ${isActive ? "block" : "hidden"} min-h-screen fixed top-0 left-0 w-full text-[3vw] mobile:text-[1.9vw] sm:text-[1.6vw] md:text-[1.3vw] lg:text-[1vw] bg-[#00000063] flex items-center justify-center p-4`}>
      <div className="bg-white rounded-2xl shadow-2xl w-[90%] sm:max-w-5xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-200">
          <h1 className="text-[1em] font-semibold text-gray-900">
            {taskToEdit && taskToEdit.id ? 'Edit Task' : 'Add New Task'}
          </h1>
          <button onClick={hideTaskForm} className={`text-[0.9em] text-gray-600 hover:text-gray-900`}>
            Go Back
          </button>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="mb-8">
              <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition"
                placeholder="Enter task title"
                required
              />
            </div>

            {/* Priority */}
            <div className="mb-10">
              <span className="block text-gray-700 font-medium mb-4">Priority</span>
              <div className="flex items-center space-x-12">
                {/* Extreme (red) */}
                <label className="flex items-center space-x-4 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value="Extreme"
                    className="hidden peer"
                    // checked={formData.priority === 'Extreme'}
                    onChange={handleRadioChange}
                  />
                  <div className={`w-6 h-6 rounded-full border-3 border-red-500 ${formData.priority == 'Extreme' ? 'bg-red-500' : 'bg-white'} transition-all duration-200`} />
                  <span className="text-lg text-gray-800">Extreme</span>
                </label>

                {/* Moderate (blue) */}
                <label className="flex items-center space-x-4 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value="High"
                    className="hidden peer"
                    // checked={formData.priority === 'High'}
                    onChange={handleRadioChange}
                  />
                  <div className={`w-6 h-6 rounded-full border-3 border-blue-500 ${formData.priority == 'High' ? 'bg-blue-500' : 'bg-white'} transition-all duration-200`} />
                  <span className="text-lg text-gray-800">High</span>
                </label>

                {/* Low (green) */}
                <label className="flex items-center space-x-4 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value="Low"
                    className="hidden peer"
                    // checked={formData.priority === 'Low'}
                    onChange={handleRadioChange}
                  />
                  <div className={`w-6 h-6 rounded-full border-3 border-green-500 ${formData.priority == 'Low' ? 'bg-green-500' : 'bg-white'} transition-all duration-200`} />
                  <span className="text-lg text-gray-800">Low</span>
                </label>
              </div>
            </div>

            {/* Task Description */}
            <div className="mb-10">
              <label className="block text-gray-700 font-medium mb-2">
                Task Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Start writing here..."
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-start">
              <button
                type="submit"
                disabled={loading}
                className={`px-10 py-4 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (taskToEdit && taskToEdit.id ? 'Updating...' : 'Creating...') : (taskToEdit && taskToEdit.id ? 'Update Task' : 'Done')}
              </button>
            </div>
          </form>
        </div>
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
  );
}