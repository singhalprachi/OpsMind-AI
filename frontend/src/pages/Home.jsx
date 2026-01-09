// src/pages/Home.jsx
import React from "react";
import ChatBox from "../components/ChatBox";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#e5ddd5] flex flex-col">
      {/* Top nav bar – WhatsApp-like header */}
      <header className="w-full bg-[#075E54] text-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center font-bold text-sm">
              OM
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">OpsMind AI</div>
              <div className="text-[11px] text-white/80">PDF Knowledge Assistant</div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-white/80">
            <span className="px-2 py-1 rounded-full border border-white/20 bg-white/10">
              GROQ · Gemini · MongoDB Atlas
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex justify-center px-2 sm:px-4 py-4 sm:py-6 overflow-hidden">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)] gap-4 sm:gap-6">
          <ChatBox />

          {/* Right side panel with instructions – light, WhatsApp-like card style */}
          <aside className="hidden lg:flex flex-col bg-[#f7f7f7] border border-[#dadada] rounded-2xl shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-[#075E54]">How it works</h2>
                <p className="text-[11px] text-gray-500">
                  RAG over your uploaded SOP / policy PDFs
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-gray-700">
              <div className="bg-white rounded-xl p-3 border border-[#e0e0e0]">
                <div className="text-[11px] font-semibold text-[#128C7E] mb-1">
                  1. Upload PDFs
                </div>
                <p className="leading-relaxed">
                  Use the <span className="font-semibold">Attach</span> button in the chat to upload one
                  or more SOP / policy documents. They are parsed, chunked into overlapping segments,
                  embedded, and indexed in MongoDB Atlas.
                </p>
              </div>

              <div className="bg-white rounded-xl p-3 border border-[#e0e0e0]">
                <div className="text-[11px] font-semibold text-[#128C7E] mb-1">
                  2. Ask questions
                </div>
                <p className="leading-relaxed">
                  Ask focused questions like{" "}
                  <span className="italic">
                    “What is the refund policy for enterprise customers?”
                  </span>{" "}
                  and the system will fetch the top relevant chunks and send them to the LLM.
                </p>
              </div>

              <div className="bg-white rounded-xl p-3 border border-[#e0e0e0]">
                <div className="text-[11px] font-semibold text-[#128C7E] mb-1">
                  3. Hallucination guard
                </div>
                <p className="leading-relaxed">
                  If the answer is not grounded in your documents, the assistant will say it{" "}
                  <span className="font-semibold">
                    doesn&apos;t know based on the provided context
                  </span>
                  .
                </p>
              </div>

              <div className="bg-transparent border-t border-[#e0e0e0] pt-3 mt-1 text-[11px] text-gray-500">
                Tip: try asking a question that is <span className="italic">not</span> in your PDFs to
                test hallucination handling.
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

