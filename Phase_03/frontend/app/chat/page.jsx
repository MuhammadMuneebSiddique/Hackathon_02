"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ChatMessage from "../components/chatMessage";
import ChatInput from "../components/chatInput";
import { sendMessage, getChatHistory } from "../../util/chat-api";

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      setLoading(true);
      const history = await getChatHistory();
      setMessages(history.messages || []);
      setError(null);
    } catch (err) {
      console.error("Failed to load chat history:", err);
      setError("Failed to load chat history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    // Add user message optimistically
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: messageText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const response = await sendMessage(messageText);

      // Add assistant response
      const assistantMessage = {
        id: response.message_id,
        role: "assistant",
        content: response.response,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to get response. Please try again.");

      // Remove the optimistic user message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-800">Task Assistant</h1>
        <p className="text-sm text-gray-500">
          Chat with your AI assistant to manage tasks
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading conversation...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-gray-400 mb-2">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-gray-600 text-lg mb-2">Start a conversation</p>
            <p className="text-gray-400 text-sm">
              Try saying: "Add a task to buy groceries"
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.created_at}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-6 py-2 bg-red-50 border-t">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Input Container */}
      <div className="border-t bg-white px-6 py-4">
        <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
      </div>
    </div>
  );
}
