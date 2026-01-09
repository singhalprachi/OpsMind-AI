// src/components/ChatBox.jsx
import React, { useEffect, useRef, useState } from "react";
import Message from "./Message";
import ReferenceCard from "./ReferenceCard";
import { startChatStream, uploadSinglePdf, uploadMultiplePdfs } from "../services/api";

export default function ChatBox() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! Upload one or more PDFs, then ask questions about them.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      citations: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [sessionId] = useState(() => {
    const existing = localStorage.getItem("opsmind_session_id");
    if (existing) return existing;
    const generated = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;
    localStorage.setItem("opsmind_session_id", generated);
    return generated;
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentCitations, setCurrentCitations] = useState([]);
  const evtRef = useRef(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const appendUserMessage = (text) => {
    setMessages((m) => [
      ...m,
      { role: "user", text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    ]);
  };

  const appendSystemMessage = (text) => {
    setMessages((m) => [
      ...m,
      { role: "ai", text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), citations: [] },
    ]);
  };

  const appendAiPlaceholder = () => {
    const placeholder = { role: "ai", text: "", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), citations: [] };
    setMessages((m) => [...m, placeholder]);
  };

  const streamAIResponse = (query) => {
    setIsStreaming(true);
    setCurrentCitations([]);
    appendAiPlaceholder();

    evtRef.current = startChatStream({
      query,
      sessionId,
      onChunk: (textChunk) => {
        setMessages((prev) => {
          const copy = [...prev];
          for (let i = copy.length - 1; i >= 0; i--) {
            if (copy[i].role === "ai") {
              copy[i] = { ...copy[i], text: (copy[i].text || "") + textChunk, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
              break;
            }
          }
          return copy;
        });
      },
      onCitation: (citation) => {
        const citArray = Array.isArray(citation) ? citation : [citation];
        setCurrentCitations((prev) => {
          const merged = [...prev, ...citArray];
          setMessages((prevMsgs) => {
            const copy = [...prevMsgs];
            for (let i = copy.length - 1; i >= 0; i--) {
              if (copy[i].role === "ai") {
                copy[i] = { ...copy[i], citations: merged };
                break;
              }
            }
            return copy;
          });
          return merged;
        });
      },
      onDone: () => {
        setIsStreaming(false);
        evtRef.current = null;
      },
      onError: (err) => {
        console.error("stream error", err);
        setIsStreaming(false);
        evtRef.current = null;
        appendSystemMessage("Sorry — something went wrong with the stream.");
      },
    });
  };

  const submit = (e) => {
    e?.preventDefault?.();
    const q = input.trim();
    if (!q) return;
    appendUserMessage(q);
    setInput("");
    streamAIResponse(q);
  };

  const stopStream = () => {
    if (evtRef.current) {
      evtRef.current.close();
      evtRef.current = null;
      setIsStreaming(false);
    }
  };

  const handleAttachClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      if (files.length === 1) {
        const file = files[0];
        appendUserMessage(`Uploaded PDF: ${file.name}`);
        const res = await uploadSinglePdf(file);
        appendSystemMessage(res.message || "PDF uploaded & ingested successfully.");
      } else {
        appendUserMessage(`Uploaded ${files.length} PDFs`);
        const res = await uploadMultiplePdfs(files);
        appendSystemMessage(res.message || "PDFs uploaded & ingested successfully.");
      }
    } catch (err) {
      console.error("upload error", err);
      appendSystemMessage(`Upload failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col h-[82vh] lg:h-[84vh] bg-[#e5ddd5] border border-[#dadada] rounded-2xl shadow-sm overflow-hidden">
      {/* header – chat contact bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#075E54] text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white font-semibold text-sm">
            AI
          </div>
          <div>
            <div className="text-sm font-semibold">OpsMind Chat</div>
            <div className="text-[11px] text-white/70 hidden md:block">
              Ask questions grounded in your uploaded PDFs
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isUploading && (
            <span className="text-[11px] text-[#CFE9BA]">Uploading &amp; ingesting…</span>
          )}
          {isStreaming ? (
            <button
              onClick={stopStream}
              className="px-3 py-1 rounded-full bg-[#D32F2F] text-white text-xs"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={() => {
                setMessages([]);
              }}
              className="px-3 py-1 rounded-full bg-white/10 text-white text-xs border border-white/20"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* messages – WhatsApp-like bubbles */}
      <div className="flex-1 overflow-y-auto bg-[#e5ddd5] px-3 sm:px-4 py-3 space-y-2">
        {messages.map((m, idx) => (
          <div key={idx} className="flex flex-col">
            <Message
              message={m.text}
              isUser={m.role === "user"}
              time={m.time}
              citations={m.citations}
            />
            {m.citations?.length > 0 && <ReferenceCard citations={m.citations} />}
          </div>
        ))}

        {isStreaming && (
          <div className="flex items-center gap-2 text-gray-600 text-xs mt-2">
            <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center text-white font-semibold text-[10px]">
              AI
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce delay-150"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce delay-300"></span>
            </div>
            <span>typing…</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* hidden file input for Attach */}
      <input
        type="file"
        accept="application/pdf"
        multiple
        ref={fileInputRef}
        onChange={handleFilesSelected}
        className="hidden"
      />

      {/* input – WhatsApp style bottom bar */}
      <form
        onSubmit={submit}
        className="px-3 sm:px-4 py-2 bg-[#f0f0f0] border-t border-[#dadada]"
      >
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleAttachClick}
            disabled={isUploading}
            className="w-9 h-9 rounded-full bg-transparent flex items-center justify-center text-[#075E54] hover:bg-[#e2e2e2] disabled:opacity-60"
            title="Attach PDF"
          >
            📎
          </button>

          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={1}
              placeholder="Type a message"
              className="w-full min-h-[38px] max-h-32 resize-none px-3 py-2 rounded-full bg-white border border-[#dadada] text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:border-[#34B7F1]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
            />
          </div>

          <button
            type="submit"
            className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white text-lg"
          >
            ➤
          </button>
        </div>
      </form>
    </div>
  );
}
