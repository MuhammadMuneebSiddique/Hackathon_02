"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ChatMessage from "../components/chatMessage";
import ChatInput from "../components/chatInput";
import { sendMessage, getChatHistory } from "../../util/chat-api";
import { useTaskContext } from "../../context/TaskContext";
import { MessageCircleDashed } from "lucide-react";

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const { fetchTasks } = useTaskContext();

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

      // Refresh tasks after chat response (in case tools modified tasks)
      await fetchTasks();
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
    <section className="text-[3vw] h-full p-[1em] rounded-[0.5em] mobile:text-[1.7vw] overflow-hidden sm:text-[1.4vw] md:text-[1.2vw] lg:text-[1vw] bg-zinc-50">
      {/* Header */}
      <div className="h-full grid grid-cols-1 grid-rows-[5em_3fr_6em] bg-white">
        <div className="px-6 py-4">
          <h1 className="text-[1.5em] font-semibold text-gray-800">Task Assistant</h1>
          <p className="text-[1.1em] text-gray-500">
            Chat with your AI assistant to manage tasks
          </p>
        </div>

        {/* Messages Container */}
        <div className="rounded-[0.5em] overflow-y-scroll w-full h-[65vh] px-6 py-4">
          {loading && messages.length === 0 ? (
            <div className="flex text-[1.1em] items-center justify-center h-full">
              <div className="text-gray-500">Loading conversation...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-gray-400 mb-2">
                <MessageCircleDashed className="w-[3.5em] h-[3.5em]" />
              </div>
              <p className="text-gray-600 text-[1.5em] font-semibold mb-2">Start a conversation</p>
              <p className="text-gray-400 text-[1.1em] ">
                Try saying: "Add a task to buy groceries"
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-[1em]  mx-auto">
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
          <div className="bg-white px-6 py-4">
            <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
          </div>

      </div>
    </section>
  );
}

