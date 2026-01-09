// import Chunk from "../models/chunk.model.js";
// import { callGroq } from "../groqTest.js";

// /**
//  * Add a new chunk to MongoDB
//  */
// export async function addChunk({ text, source, page }) {
//   const chunk = await Chunk.create({
//     text,
//     source,
//     page,
//   });

//   return chunk;
// }

// /**
//  * Get top K chunks (simple retrieval without embeddings)
//  */
// export async function getTopChunks(query, k = 3) {
//   const chunks = await Chunk.find().lean();
//   return chunks.slice(0, k); // simply top K latest chunks
// }

// /**
//  * Stream LLM response via SSE
//  */
// export async function streamLLMResponse(userQuery, chunks, res) {
//   const systemPrompt = `
// You are an enterprise assistant. Use ONLY the provided context:
// ${chunks.map((c) => c.text).join("\n\n")}
// User question: ${userQuery}
// If answer not found, say "I don't know."
// `;

//   try {
//     const aiResponse = await callGroq(systemPrompt);

//     // Stream in small chunks
//     const chunkSize = 50;
//     for (let i = 0; i < aiResponse.length; i += chunkSize) {
//       const tokenChunk = aiResponse.slice(i, i + chunkSize);
//       res.write(`data: ${JSON.stringify({ text: tokenChunk, citation: [] })}\n\n`);
//       await new Promise((r) => setTimeout(r, 50));
//     }

//     res.end();
//   } catch (err) {
//     console.error("Groq streaming error:", err);
//     res.write(`data: ${JSON.stringify({ text: "Error occurred", citation: [] })}\n\n`);
//   }
// }

// import Chunk from "../models/chunk.model.js";
// import { generateEmbedding } from "./embed.service.js";
// import { callGroq } from "../groqTest.js";

// /**
//  * Vector-based retrieval
//  */
// export async function getTopChunks(query, k = 3) {
//   const queryVector = await generateEmbedding(query, "search_query");

//   const chunks = await Chunk.aggregate([
//     {
//       $vectorSearch: {
//         index: "vector_index", // Atlas index name
//         path: "vector",
//         queryVector,
//         numCandidates: 100,
//         limit: k,
//       },
//     },
//     {
//       $project: {
//         text: 1,
//         source: 1,
//         page: 1,
//         score: { $meta: "vectorSearchScore" },
//       },
//     },
//   ]);

//   return chunks;
// }

// /**
//  * RAG + SSE Streaming
//  */
// export async function streamLLMResponse(userQuery, chunks, res) {
//   const context = chunks
//     .map(
//       (c, i) =>
//         `[${i + 1}] Source: ${c.source}, Page: ${c.page}\n${c.text}`
//     )
//     .join("\n\n");

//   const prompt = `
// You are a helpful assistant.
// Answer ONLY from the context below.
// If answer not found, say "I don't know".

// Context:
// ${context}

// Question:
// ${userQuery}
// `;

//   try {
//     const answer = await callGroq(prompt);

//     const chunkSize = 40;
//     for (let i = 0; i < answer.length; i += chunkSize) {
//       res.write(
//         `data: ${JSON.stringify({
//           text: answer.slice(i, i + chunkSize),
//         })}\n\n`
//       );
//       await new Promise((r) => setTimeout(r, 40));
//     }

//     res.end();
//   } catch (err) {
//     console.error(err);
//     res.write(`data: ${JSON.stringify({ text: "Error occurred" })}\n\n`);
//     res.end();
//   }
// }
// import cohere from "cohere-ai";
// cohere.init(process.env.T8zRyIXSwapz0PcYFB29hBfbvqOnGN1YH9zsyrsg);

// export async function streamLLMResponse(prompt, chunks, safeWrite){
//   try {
//     const response = await cohere.generate({
//       model: "command-xlarge", // Cohere ka model
//       prompt,
//       max_tokens: 300,
//       temperature: 0.3,
//     });

//     const answer = response.body.generations[0].text;

//     // Simulate streaming by chunking
//     const chunkSize = 40;
//     for (let i = 0; i < answer.length; i += chunkSize) {
//       safeWrite(JSON.stringify({ text: answer.slice(i, i + chunkSize) }));
//       await new Promise((r) => setTimeout(r, 50));
//     }

//   } catch (err) {
//     console.error("Cohere error:", err);
//     safeWrite(JSON.stringify({ text: "Error occurred", citation: [] }));
//   }
// }
// backend/src/services/chunk.service.js


// var Chunk = require("../models/chunk.model.js");
// var generateEmbedding = require("./embed.service.js").generateEmbedding;
// var Cohere = require("cohere-ai");

// var cohere = new Cohere({ apiKey: process.env.T8zRyIXSwapz0PcYFB29hBfbvqOnGN1YH9zsyrsg });

// function getTopChunks(query, k) {
//   if (!k) k = 3;
//   return generateEmbedding(query, "search_query").then(function (queryVector) {
//     return Chunk.aggregate([
//       {
//         $vectorSearch: {
//           index: "vector_index",
//           path: "vector",
//           queryVector: queryVector,
//           numCandidates: 100,
//           limit: k
//         }
//       },
//       {
//         $project: {
//           text: 1,
//           source: 1,
//           page: 1,
//           score: { $meta: "vectorSearchScore" }
//         }
//       }
//     ]);
//   });
// }

// function streamLLMResponse(prompt, chunks, safeWrite) {
//   return cohere.generate({
//     model: "command-xlarge",
//     prompt: prompt,
//     max_tokens: 512,
//     temperature: 0.2
//   }).then(function (response) {
//     var answer = (response.body.generations[0].text || "").toString();

//     if (!answer.trim()) {
//       safeWrite(JSON.stringify({ text: "Not found in the document", citation: [] }));
//       return;
//     }

//     // simulate streaming in chunks
//     var chunkSize = 80;
//     for (var i = 0; i < answer.length; i += chunkSize) {
//       safeWrite(JSON.stringify({ text: answer.slice(i, i + chunkSize) }));
//     }

//     if (chunks && chunks.length > 0) {
//       var citationArray = chunks.map(function (c) {
//         return { source: c.source || "unknown", page: c.page || null };
//       });
//       safeWrite(JSON.stringify({ citation: citationArray }));
//     }
//   }).catch(function (err) {
//     console.error("streamLLMResponse error:", err);
//     safeWrite(JSON.stringify({ text: "Error occurred", citation: [] }));
//   });
// }

// // exports
// module.exports = {
//   getTopChunks: getTopChunks,
//   streamLLMResponse: streamLLMResponse
// };
import Chunk from "../models/chunk.model.js";
import { generateEmbedding } from "./embed.service.js";
import { generateStreamedAnswer } from "../groqTest.js";

/**
 * Split text into 1000-character chunks with 200-character overlap.
 */
export function splitIntoChunks(text, chunkSize = 1000, overlap = 200) {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  const chunks = [];
  let index = 0;
  while (index < clean.length) {
    const chunkText = clean.slice(index, index + chunkSize);
    chunks.push(chunkText);
    index += chunkSize - overlap;
  }
  return chunks;
}

/**
 * Persist a list of chunks with embeddings to MongoDB Atlas.
 */
export async function storeChunks(chunks, source) {
  for (let i = 0; i < chunks.length; i++) {
    const text = chunks[i];
    const vector = await generateEmbedding(text, "search_document");
    await Chunk.create({
      text,
      source,
      page: i + 1,
      vector,
    });
  }
}

/**
 * Retrieve top-k chunks using vector similarity.
 * Uses in-app cosine similarity over stored embeddings to avoid
 * any Atlas $vectorSearch configuration issues.
 */
export const getTopChunks = async (query, k = 3) => {
  try {
    console.log("🔎 getTopChunks called with query:", query);

    const total = await Chunk.countDocuments();
    console.log("📦 Total chunks in DB:", total);
    if (!total) return [];

    // 1) Build embedding for the query
    const queryVector = await generateEmbedding(query, "search_query");

    // 2) Load all chunks with vectors from DB
    const allChunks = await Chunk.find(
      {},
      { text: 1, source: 1, page: 1, vector: 1 }
    ).lean();

    if (!allChunks.length) return [];

    // 3) Cosine similarity helper
    const dot = (a, b) => a.reduce((sum, v, i) => sum + v * (b[i] || 0), 0);
    const norm = (v) =>
      Math.sqrt(v.reduce((sum, x) => sum + x * x, 0)) || 1;

    const qNorm = norm(queryVector);

    const scored = allChunks.map((c) => {
      const v = c.vector || [];
      const sim = dot(queryVector, v) / (qNorm * norm(v));
      return { ...c, score: sim };
    });

    // 4) Sort by similarity and take top-k
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, k);

    console.log("✅ Local vector similarity returned", top.length, "chunks");
    return top;
  } catch (err) {
    console.error("❌ getTopChunks failed:", err.message);
    return [];
  }
};

/**
 * Stream Groq response token-by-token to SSE writer.
 * Includes hallucination guard to refuse when context missing.
 */
export const streamLLMResponse = async (userQuery, chunks, safeWrite) => {
  const context = chunks
    .map((c, i) => `[${i + 1}] Source: ${c.source}, Page: ${c.page}\n${c.text}`)
    .join("\n\n");

  const prompt = `
You are a retrieval-augmented assistant.
Use ONLY the provided context. If the answer is not in the context, respond with "I don't know based on the provided documents."

Context:
${context}

User question:
${userQuery}
`;

  let assembled = "";
  try {
    await generateStreamedAnswer(prompt, (token) => {
      assembled += token;
      safeWrite(
        JSON.stringify({
          text: token,
        })
      );
    });

    // send citation list once at end
    const citationArray = chunks.map((c) => ({
      source: c.source,
      page: c.page,
    }));
    safeWrite(JSON.stringify({ citation: citationArray }));
    return assembled;
  } catch (err) {
    console.error("LLM streaming error:", err);
    safeWrite(
      JSON.stringify({
        text: "Error occurred",
        citation: [],
      })
    );
    return assembled;
  }
};
