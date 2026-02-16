import { cookies } from 'next/headers';
import { authClient } from './better-auth-client';

// Server function to fetch tasks for the authenticated user
export async function getTasksServer() {
  try {
    // Get the auth token from cookies
    const tokenResult = await authClient.token();
    const token = tokenResult?.data?.token;

    if (!token) {
      throw new Error('Authentication token not found');
    }

    // Get user ID from session
    const sessionResult = await authClient.getSession();
    if (!sessionResult?.data?.user) {
      throw new Error('User not authenticated');
    }

    const userId = sessionResult.data.user.id;

    // Make the API request with the token
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api'}/${userId}/tasks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store', // Don't cache to ensure fresh data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }

    const tasks = await response.json();

    // Transform backend data to match frontend expectations
    return tasks.map(task => ({
      ...task,
      status: task.is_completed ? 'Completed' : (task.status || 'Not Started'),
      createdDate: task.created_at ? new Date(task.created_at).toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) : 'Unknown',
      isSelected: false, // Default value for UI state
    }));
  } catch (error) {
    console.error('Error fetching tasks on server:', error);
    return []; // Return empty array in case of error to avoid breaking the UI
  }
}