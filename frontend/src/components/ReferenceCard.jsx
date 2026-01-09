// src/components/ReferenceCard.jsx
import React from "react";

export default function ReferenceCard({ citations = [] }) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="bg-gray-50 border-l-4 border-blue-500 p-3 rounded-md text-xs text-gray-700 mt-2">
      {citations.map((c, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <a
            href={c.source || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {c.source ? new URL(c.source, window.location.href).pathname.replace("/", "") : "Source"}
          </a>
          <span className="text-gray-500">, Page {c.page ?? "-"}</span>
        </div>
      ))}
    </div>
  );
}




