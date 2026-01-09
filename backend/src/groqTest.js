// // src/groqTest.js
// import Groq from "groq-sdk";
// import "dotenv/config";

// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY,
// });

// // Named export for chat service
// export async function callGroq(prompt) {
//   let result = "";
//   const stream = await groq.chat.completions.create({
//     model: "llama-3.1-8b-instant",
//     messages: [
//       { role: "system", content: "You are an enterprise assistant." },
//       { role: "user", content: prompt },
//     ],
//     stream: true,
//     temperature: 0.2,
//   });

//   for await (const chunk of stream) {
//     const token = chunk.choices[0]?.delta?.content;
//     if (token) result += token;
//   }

//   return result;
// }

// // Optional: keep your callback-style streaming too
// export async function generateStreamedAnswer(prompt, onToken) {
//   const stream = await groq.chat.completions.create({
//     model: "llama-3.1-8b-instant",
//     messages: [
//       { role: "system", content: "You are an enterprise assistant." },
//       { role: "user", content: prompt },
//     ],
//     stream: true,
//     temperature: 0.2,
//   });

//   for await (const chunk of stream) {
//     const token = chunk.choices[0]?.delta?.content;
//     if (token) onToken(token);
//   }
// }





// src/groqTest.js
import Groq from "groq-sdk";
import "dotenv/config";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Collect full response (used in RAG pipeline)
 */
export async function callGroq(prompt) {
  let result = "";

  const stream = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: "You are an enterprise assistant. Answer only from the given context." },
      { role: "user", content: prompt },
    ],
    stream: true,
    temperature: 0.2,
  });

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content;
    if (token) result += token;
  }

  return result;
}

/**
 * True streaming (SSE / websocket use)
 */
export async function generateStreamedAnswer(prompt, onToken) {
  const stream = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: "You are an enterprise assistant. Answer only from the given context." },
      { role: "user", content: prompt },
    ],
    stream: true,
    temperature: 0.2,
  });

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content;
    if (token) {
      onToken(token); // SSE write happens outside
    }
  }
}
