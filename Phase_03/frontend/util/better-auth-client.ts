import { createAuthClient } from 'better-auth/client';
import { jwtClient } from 'better-auth/client/plugins';

// Initialize Better Auth client with JWT plugin
export const authClient = createAuthClient({
  baseURL:process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||'http://localhost:3000',
  plugins: [
    jwtClient()
  ]
});

// Export auth utilities
export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;
export const getSession = authClient.getSession;
export const useSession = authClient.useSession;
export const authToken = authClient.token