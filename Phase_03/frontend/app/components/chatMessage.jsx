"use client";

import { formatDistanceToNow } from "date-fns";

export default function ChatMessage({ role, content, timestamp }) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-white border border-gray-200 text-gray-800"
        }`}
      >
        {/* Avatar */}
        <div className="flex items-start gap-3">
          {!isUser && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          <div className="flex-1">
            {/* Role Label */}
            <div className={`text-xs mb-1 ${isUser ? "text-blue-200" : "text-gray-500"}`}>
              {isUser ? "You" : "Assistant"}
            </div>

            {/* Message Content */}
            <div className="text-sm whitespace-pre-wrap">{content}</div>

            {/* Timestamp */}
            {timestamp && (
              <div
                className={`text-xs mt-2 ${
                  isUser ? "text-blue-200" : "text-gray-400"
                }`}
              >
                {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
              </div>
            )}
          </div>

          {isUser && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
