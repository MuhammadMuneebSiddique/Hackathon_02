import axios from 'axios';
import { authClient } from './better-auth-client';
import { getSessionData } from './authentication-methods';

// Create axios instance with base configuration

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Better Auth token
api.interceptors.request.use(
  async (config) => {
    // Get the current session from Better Auth
    const tokenResult = await authClient.token();
    if (tokenResult) {
      config.headers.Authorization = `Bearer ${tokenResult.data.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


// TASKS API METHODS
export const tasksAPI = {


  // Get all tasks for the authenticated user
  getTasks: async () => {
    const sessionData = await getSessionData();
    if (!sessionData || !sessionData.user) {
      throw new Error('User not authenticated');
    }
    const {user} = sessionData;
    const user_id = user.id;
    return api.get(`${user_id}/tasks`).then(response => {
      // Transform backend data to match frontend expectations
      return response.data.map(task => ({
        ...task,
        status: task.is_completed ? 'Completed' : (task.status || 'Not Started'), // Map backend field to frontend expectation // Map backend field to frontend expectation
        createdDate: task.created_at ? new Date(task.created_at).toLocaleDateString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : 'Unknown',
        isSelected: false, // Default value for UI state
      }));
    });
  },

  // Create a new task
  createTask: async (taskData) => {
    const sessionData = await getSessionData();
    if (!sessionData || !sessionData.user) {
      throw new Error('User not authenticated');
    }
    const {user} = sessionData;
    const user_id = user.id;
    // Transform frontend data to match backend expectations
    const transformedData = {
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority || 'Medium', // Default priority if not provided
      is_completed: taskData.is_completed || false, // Default to not completed
    };

    return api.post(`${user_id}/tasks`, transformedData).then(response => {
      // Transform response back to frontend format
      const task = response.data;
      return {
        ...task,
        status: task.is_completed ? 'Completed' : (task.status || 'Not Started'), // Map backend field to frontend expectation
        createdDate: task.created_at ? new Date(task.created_at).toLocaleDateString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : 'Unknown',
        isSelected: false,
      };
    });
  },

  // Get a specific task by ID
  getTaskById: async (taskId) => {
    const sessionData = await getSessionData();
    if (!sessionData || !sessionData.user) {
      throw new Error('User not authenticated');
    }
    const {user} = sessionData;
    const user_id = user.id;
    return api.get(`${user_id}/tasks/${taskId}`).then(response => {
      const task = response.data;
      return {
        ...task,
        status: task.is_completed ? 'Completed' : (task.status || 'Not Started'), // Map backend field to frontend expectation
        createdDate: task.created_at ? new Date(task.created_at).toLocaleDateString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : 'Unknown',
        isSelected: false,
      };
    });
  },

  // Update a task
  updateTask: async (taskId, taskData) => {
    const sessionData = await getSessionData();
    if (!sessionData || !sessionData.user) {
      throw new Error('User not authenticated');
    }
    const {user} = sessionData;
    const user_id = user.id;
    // Transform frontend data to match backend expectations
    const transformedData = {};

    if (taskData.title !== undefined) transformedData.title = taskData.title;
    if (taskData.description !== undefined) transformedData.description = taskData.description;
    if (taskData.priority !== undefined) transformedData.priority = taskData.priority;
    if (taskData.is_completed !== undefined) transformedData.is_completed = taskData.is_completed;

    return api.put(`${user_id}/tasks/${taskId}`, transformedData).then(response => {
      const task = response.data;
      return {
        ...task,
        status: task.is_completed ? 'Completed' : (task.status || 'Not Started'), // Map backend field to frontend expectation
        createdDate: task.created_at ? new Date(task.created_at).toLocaleDateString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : 'Unknown',
        isSelected: false,
      };
    });
  },

  // Toggle task completion status
  toggleTaskCompletion:async (taskId, isCompleted) => {
    const sessionData = await getSessionData();
    if (!sessionData || !sessionData.user) {
      throw new Error('User not authenticated');
    }
    const {user} = sessionData;
    const user_id = user.id;
    return api.patch(`${user_id}/tasks/${taskId}/toggle`, { is_completed: !isCompleted }).then(response => {
      const task = response.data;
      return {
        ...task,
        status: task.is_completed ? 'Completed' : (task.status || 'Not Started'), // Map backend field to frontend expectation
        createdDate: task.created_at ? new Date(task.created_at).toLocaleDateString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : 'Unknown',
        isSelected: false,
      };
    });
  },

  // Delete a task
  deleteTask: async (taskId) => {
    const sessionData = await getSessionData();
    if (!sessionData || !sessionData.user) {
      throw new Error('User not authenticated');
    }
    const {user} = sessionData;
    const user_id = user.id;
    return api.delete(`${user_id}/tasks/${taskId}`);
  },

  // Update user profile
  updateUserProfile:async (userData) => {
    const sessionData = await getSessionData();
    if (!sessionData || !sessionData.user) {
      throw new Error('User not authenticated');
    }
    const {user} = sessionData;
    const user_id = user.id;
    return api.put(`${user_id}/profile`, userData).then(response => {
      return response.data;
    });
  },

  // Get user profile
  getUserProfile: async () => {
    const sessionData = await getSessionData();
    if (!sessionData || !sessionData.user) {
      throw new Error('User not authenticated');
    }
    const {user} = sessionData;
    const user_id = user.id;
    return api.get(`${user_id}/profile`).then(response => {
      return response.data;
    });
  }
};

export default api;