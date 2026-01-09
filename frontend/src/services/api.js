const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const FRONTEND_API_KEY = process.env.REACT_APP_API_KEY || "";

export function startChatStream({ query, sessionId, onChunk, onCitation, onDone, onError }) {
  const encoded = encodeURIComponent(query);
  const sessionParam = sessionId ? `&sessionId=${encodeURIComponent(sessionId)}` : "";
  const apiKeyParam = FRONTEND_API_KEY ? `&api_key=${encodeURIComponent(FRONTEND_API_KEY)}` : "";
  const url = `${API_BASE}/api/chat/stream?query=${encoded}${sessionParam}${apiKeyParam}`;
  const evtSource = new EventSource(url);

  evtSource.onmessage = (e) => {
    if (!e.data) return;
    if (e.data === "[DONE]") {
      onDone && onDone();
      evtSource.close();
      return;
    }

    try {
      const data = JSON.parse(e.data);
      // data expected shape: { text: "...", citation: [{source, page}, ...] }
      if (data.text) onChunk && onChunk(data.text);
      if (data.citation) onCitation && onCitation(data.citation);
    } catch (err) {
      console.error("Invalid JSON chunk", err);
    }
  };

  evtSource.onerror = (err) => {
    onError && onError(err);
    evtSource.close();
  };

  return evtSource;
}

export async function uploadSinglePdf(file) {
  const formData = new FormData();
  formData.append("pdf", file);

  const apiKeyParam = FRONTEND_API_KEY ? `?api_key=${encodeURIComponent(FRONTEND_API_KEY)}` : "";
  const res = await fetch(`${API_BASE}/api/upload${apiKeyParam}`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Upload failed");
  }
  return res.json();
}

export async function uploadMultiplePdfs(files) {
  const formData = new FormData();
  Array.from(files).forEach((f) => formData.append("files", f));

  const apiKeyParam = FRONTEND_API_KEY ? `?api_key=${encodeURIComponent(FRONTEND_API_KEY)}` : "";
  const res = await fetch(`${API_BASE}/api/upload/upload-multiple${apiKeyParam}`, {
    method: "POST",
    body: formData,
  });  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Upload failed");
  }
  return res.json();
}
