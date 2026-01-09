// src/components/Message.jsx
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Message({ message, isUser, time, citations }) {
  const [hover, setHover] = useState(false);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(message);
      // small feedback could be added
    } catch (e) {
      console.error("copy failed", e);
    }
  };

  return (
    <div
      className={`flex items-end gap-3 ${isUser ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {!isUser && (
        <div className="w-9 h-9 rounded-full bg-[#10a37f] flex items-center justify-center text-white font-semibold">
          AI
        </div>
      )}

      <div className="flex flex-col items-start">
        <div
          className={`relative max-w-[78%] md:max-w-[70%] break-words p-3 text-sm leading-6
            ${isUser ? "bg-[#dcfce7] text-black rounded-bl-2xl rounded-tr-2xl rounded-tl-xl rounded-br-xl ml-auto shadow" :
                      "bg-white text-gray-800 rounded-br-2xl rounded-tl-2xl rounded-tr-xl rounded-bl-xl shadow"}`}
          style={{ wordBreak: "break-word" }}
        >
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{message}</ReactMarkdown>
          </div>

          {/* Hover actions */}
          {hover && (
            <div className={`absolute ${isUser ? "left-2" : "right-2"} top-1/2 -translate-y-1/2 flex gap-1`}>
              <button
                onClick={copyText}
                className="p-1 rounded-md hover:bg-gray-100 text-gray-500 text-xs"
                title="Copy"
              >
                Copy
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400">{time}</span>
          {citations?.length > 0 && (
            <span className="text-xs text-blue-500">• {citations.length} source</span>
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-gray-700">
          You
        </div>
      )}
    </div>
  );
}








