"use client";

import { formatDistanceToNow } from "date-fns";
import { Bot, User } from "lucide-react";

export default function ChatMessage({ role, content, timestamp }) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={` mobile:max-w-[70%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-blue-600 text-white max-w-[50%]"
            : "bg-white border w-full border-gray-200 text-gray-800"
        }`}
      >
        {/* Avatar */}
        <div className="flex items-start gap-3">
          {!isUser && (
            <div className="shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <Bot className="w-[2em] h-[2em]" />
            </div>
          )}

          <div className="flex-1">
            {/* Role Label */}
            <div className={`text-[0.8em] mb-1 ${isUser ? "text-blue-200" : "text-gray-500"}`}>
              {isUser ? "You" : "Assistant"}
            </div>

            {/* Message Content */}
            <div className="text-[1.2em] whitespace-pre-wrap">{content}</div>

            {/* Timestamp */}
            {timestamp && (
              <div
                className={`text-[0.7em] mt-2 ${
                  isUser ? "text-blue-200" : "text-gray-400"
                }`}
              >
                {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
              </div>
            )}
          </div>

          {isUser && (
            <div className="shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <User className="w-[2em] h-[2em]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
