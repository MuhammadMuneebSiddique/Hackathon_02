/**
 * Chat API client for communicating with the backend chat endpoint.
 */
import api from "./api";
import { getSessionData } from "./authentication-methods";

/**
 * Send a message to the AI assistant and get a response.
 *
 * @param {string} message - The message to send
 * @returns {Promise<Object>} - Response with response text, conversation_id, message_id
 */
export async function sendMessage(message) {
  try {
    // Get the current session using the same pattern as tasks API
    const sessionData = await getSessionData();
    if (!sessionData || !sessionData.user) {
      throw new Error("User not authenticated");
    }

    const user_id = sessionData.user.id;
    const response = await api.post(`${user_id}/chat`, {
      message: message,
    });

    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

/**
 * Get chat history for the current user.
 *
 * @returns {Promise<Object>} - Response with conversation_id and messages array
 */
export async function getChatHistory() {
  try {
    // Get the current session using the same pattern as tasks API
    const sessionData = await getSessionData();
    if (!sessionData || !sessionData.user) {
      throw new Error("User not authenticated");
    }

    const user_id = sessionData.user.id;
    const response = await api.get(`${user_id}/chat/history`);
    return response.data;
  } catch (error) {
    console.error("Error getting chat history:", error);
    throw error;
  }
}

/**
 * Get the current user ID from local storage or auth context.
 * This assumes Better Auth stores user info in localStorage.
 *
 * @deprecated Use getSessionData() from authentication-methods instead
 * @returns {string|null} - User ID or null if not authenticated
 */
function getUserId() {
  // Try to get user from localStorage (Better Auth session)
  if (typeof window !== "undefined") {
    const session = localStorage.getItem("better-auth.session");
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        return sessionData?.user?.id || null;
      } catch {
        return null;
      }
    }

    // Alternative: check for user object directly
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user?.id || null;
      } catch {
        return null;
      }
    }
  }

  return null;
}

export default {
  sendMessage,
  getChatHistory,
};
