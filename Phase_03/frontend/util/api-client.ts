import axios from 'axios';
import { authClient } from './better-auth-client';

// Create an Axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001', // Default to local backend
});

// Request interceptor to add JWT token to all requests
apiClient.interceptors.request.use(
  async (config) => {
    // ✅ Skip OPTIONS
    if (config.method?.toUpperCase() === "OPTIONS") {
      return config;
    }

    const tokenResult = await authClient.token();

    const token = tokenResult?.data?.token;

    // ✅ Only attach if token is valid
    if (token && typeof token === "string") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// Response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - maybe redirect to login
      console.error('Unauthorized access - token may be expired');
    }
    return Promise.reject(error);
  }
);

export default apiClient;