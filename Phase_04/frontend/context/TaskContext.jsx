'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { tasksAPI } from '../util/api';

const TaskContext = createContext();

const actionTypes = {
  SET_TASKS: 'SET_TASKS',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
};

const taskReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_TASKS:
      return { ...state, tasks: action.payload, loading: false, error: null };
    case actionTypes.ADD_TASK:
      return { ...state, tasks: [...state.tasks, action.payload] };
    case actionTypes.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    case actionTypes.DELETE_TASK:
      return { ...state, tasks: state.tasks.filter(task => task.id !== action.payload) };
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

const initialState = {
  tasks: [],
  loading: true,
  error: null,
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  const fetchTasks = useCallback(async () => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const tasks = await tasksAPI.getTasks();
      dispatch({ type: actionTypes.SET_TASKS, payload: tasks });
    } catch (error) {
      // Handle authentication errors specifically
      if (error.message.includes('User not authenticated')) {
        // Don't set an error state for auth issues - just leave tasks as empty
        dispatch({ type: actionTypes.SET_TASKS, payload: [] });
      } else {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      }
    }
  }, []);

  const updateTask = useCallback(async (taskId, taskData) => {
    try {
      const updatedTask = await tasksAPI.updateTask(taskId, taskData);
      dispatch({ type: actionTypes.UPDATE_TASK, payload: updatedTask });
      return updatedTask;
    } catch (error) {
      // Handle authentication errors specifically
      if (error.message.includes('User not authenticated')) {
        window.location.href = '/login'; // Redirect to login if not authenticated
        return;
      }
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    try {
      await tasksAPI.deleteTask(taskId);
      dispatch({ type: actionTypes.DELETE_TASK, payload: taskId });
    } catch (error) {
      // Handle authentication errors specifically
      if (error.message.includes('User not authenticated')) {
        window.location.href = '/login'; // Redirect to login if not authenticated
        return;
      }
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  const markTaskComplete = useCallback(async (taskId) => {
    try {
      const updatedTask = await tasksAPI.updateTask(taskId, { is_completed: true });
      dispatch({ type: actionTypes.UPDATE_TASK, payload: updatedTask });
      return updatedTask;
    } catch (error) {
      // Handle authentication errors specifically
      if (error.message.includes('User not authenticated')) {
        window.location.href = '/login'; // Redirect to login if not authenticated
        return;
      }
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  const toggleTaskCompletion = useCallback(async (taskId, currentStatus) => {
    try {
      const updatedTask = await tasksAPI.toggleTaskCompletion(taskId, currentStatus);
      dispatch({ type: actionTypes.UPDATE_TASK, payload: updatedTask });
      return updatedTask;
    } catch (error) {
      // Handle authentication errors specifically
      if (error.message.includes('User not authenticated')) {
        window.location.href = '/login'; // Redirect to login if not authenticated
        return;
      }
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  const createTask = useCallback(async (taskData) => {
    try {
      const newTask = await tasksAPI.createTask(taskData);
      dispatch({ type: actionTypes.ADD_TASK, payload: newTask });
      return newTask;
    } catch (error) {
      // Handle authentication errors specifically
      if (error.message.includes('User not authenticated')) {
        window.location.href = '/login'; // Redirect to login if not authenticated
        return;
      }
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);


  // Initialize tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const value = {
    tasks: state.tasks,
    loading: state.loading,
    error: state.error,
    fetchTasks,
    updateTask,
    deleteTask,
    markTaskComplete,
    toggleTaskCompletion,
    createTask,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};