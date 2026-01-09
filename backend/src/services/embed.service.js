// import fetch from "node-fetch";

// export async function generateEmbedding(text) {
//   const response = await fetch("https://api.cohere.ai/v1/embed", {
//     method: "POST",
//     headers: {
//       "Authorization": `Bearer ${process.env.COHERE_API_KEY}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       model: "embed-english-v3.0",
//       texts: [text],
//       input_type: "search_document"
//     }),
//   });

//   const data = await response.json();

//   if (!data.embeddings) {
//     throw new Error("Cohere embedding failed: " + JSON.stringify(data));
//   }

//   return data.embeddings[0];
// }


const LOCAL_DIM = 128;

/**
 * Local, deterministic embedding with no external API calls.
 * NOTE: This is NOT semantically rich like real embeddings, but is enough
 * to demonstrate vector search + RAG end‑to‑end without hitting rate limits.
 */
export async function generateEmbedding(text, type = "search_document") {
  const cleaned = (text || "").trim();
  if (!cleaned) {
    return Array(LOCAL_DIM).fill(0);
  }

  const vec = new Array(LOCAL_DIM).fill(0);

  // Simple character‑based hashing
  for (let i = 0; i < cleaned.length; i++) {
    const code = cleaned.charCodeAt(i);
    const idx = code % LOCAL_DIM;
    vec[idx] += code;
  }

  // Light word‑based hashing for a bit more spread
  const words = cleaned.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    let hash = 0;
    const w = words[i];
    for (let j = 0; j < w.length; j++) {
      hash = (hash * 31 + w.charCodeAt(j)) >>> 0; // unsigned 32‑bit
    }
    const idx = hash % LOCAL_DIM;
    vec[idx] += (hash % 1000);
  }

  // Optional: normalize length to avoid huge magnitudes for long texts
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

