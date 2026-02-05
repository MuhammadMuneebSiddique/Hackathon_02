import { signIn, signUp, signOut, getSession } from './better-auth-client';

// Define User type
interface User {
  id: string;
  email: string;
  name?: string;
  [key: string]: any; // Allow additional properties
}

// Define Credentials type
interface Credentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Define UserData type
interface UserData {
  email: string;
  name?: string;
  password: string;
  [key: string]: any;
}

// Define AuthResponse type
interface AuthResponse {
  success: boolean;
  user?: User;
  [key: string]: any;
}

// Auth context to manage authentication state across the app
class AuthManager {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;

  constructor() {
    this.isAuthenticated = false;
    this.token = null;
    this.user = null;
  }

  initializeAuth = async () => {
    // Initialization is handled by the BetterAuthProvider component
  };

  login = async (credentials: Credentials): Promise<AuthResponse> => {
    try {
      // Use Better Auth for login with enhanced options
      const result: any = await signIn.email({
        email: credentials.email,
        password: credentials.password,
        callbackURL: '/dashboard', // Redirect after login
        rememberMe: credentials.rememberMe || false // Remember the user session
      }, {
        onError: (ctx: any) => {
          // Display error message
          console.error('Login error:', ctx.error.message);
        },
      });

      if (result && !result.error) {
        // The session will be managed by the BetterAuthProvider
        this.isAuthenticated = !this.isAuthenticated;

        // Update user info
        this.user = result.user;

        // Return user info from the result
        return { success: true, user: result.user };
      } else if (result?.error) {
        // Better Auth typically returns error details in the result object
        const errorMessage = result.error.message || result.error || 'Invalid email or password';
        throw new Error(errorMessage);
      }

      throw new Error('Login failed');
    } catch (error: any) {
      const errorMessage = error.message || 'Invalid email or password';
      throw new Error(errorMessage);
    }
  };

  register = async (userData: UserData): Promise<AuthResponse> => {
    try {
      // Use Better Auth for registration with enhanced options
      const result: any = await signUp.email({
        name: userData.name || '', // Optional name field
        email: userData.email,
        password: userData.password,
        callbackURL: '/dashboard', // Redirect after registration
      }, {
        onError: (ctx: any) => {
          // Display error message
          console.log('Registration error:', ctx.error?.message || ctx.error);
        },
      });

      if (result && !result.error) {
        // The session will be managed by the BetterAuthProvider
        this.isAuthenticated = !this.isAuthenticated;

        // Update user info
        this.user = result.user;

        return { success: true, user: result.user };
      } else if (result?.error) {
        // Better Auth typically returns error details in the result object
        const errorMessage = result.error.message || result.error || 'Registration failed';
        throw new Error(errorMessage);
      }

      throw new Error('Registration failed');
    } catch (error: any) {
      console.error('Registration error caught:', error);
      const errorMessage = error.message || error?.error?.message || 'Registration failed. Please check your details.';
      throw new Error(errorMessage);
    }
  };

  logout = async () => {
    try {
      // Call Better Auth logout
      const result: any = await signOut({
        fetchOptions: {
          onSuccess: () => {
            console.log('Logout successful');
          },
          onError: (ctx: any) => {
            console.error('Logout error:', ctx.error.message);
          },
        },
      });

      if (result?.error) {
        console.warn('Logout error:', result.error.message || result.error);
      }
    } catch (error) {
      console.warn('Logout failed:', error);
    } finally {
      // Clear local state
      this.token = null;
      this.user = null;
      this.isAuthenticated = false;
    }
  };

  getAuthToken = async () => {
    // Token will be handled by the BetterAuthProvider
    // This is kept for compatibility
    return this.token;
  };

  getCurrentUser = async (): Promise<User | null> => {
    // User info will be handled by the BetterAuthProvider
    // This is kept for compatibility
    return this.user;
  };

  // Method to get session using Better Auth's getSession
  getSessionData = async () => {
    try {
      const sessionResult = await getSession();
      return sessionResult?.data || null;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  };

  // Method to check if session is still valid
  isSessionValid = async () => {
    // Check will be handled by the BetterAuthProvider
    const session = await this.getSessionData();
    return !!(session && session.user);
  };
}

// Create a singleton instance
export const authManager = new AuthManager();

// Export authentication methods
export const login = authManager.login;
export const register = authManager.register;
export const logout = authManager.logout;
export const isAuthenticated = () => authManager.isAuthenticated;
export const getCurrentUser = authManager.getCurrentUser;
export const getAuthToken = authManager.getAuthToken;
export const getSessionData = authManager.getSessionData;