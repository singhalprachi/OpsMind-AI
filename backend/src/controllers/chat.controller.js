// // src/controllers/chat.controller.js
// import { getTopChunks } from "../services/chunk.service.js";
// import { streamLLMResponse } from "../services/chat.service.js";

// export const streamResponse = async (req, res) => {
//   const userQuery = req.query.query;
//   if (!userQuery) return res.status(400).send("Query is required");

//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");
//   res.flushHeaders();

//   try {
//     const chunks = await getTopChunks(userQuery, 3);

//     if (!chunks.length) {
//       res.write(`data: ${JSON.stringify({ text: "I don't know", citation: [] })}\n\n`);
//       res.end();
//       return;
//     }

//     await streamLLMResponse(userQuery, chunks, res);
//     res.end();
//   } catch (err) {
//     console.error(err);
//     res.write(`data: ${JSON.stringify({ text: "Error occurred", citation: [] })}\n\n`);
//     res.end();
//   
import { getTopChunks, streamLLMResponse } from "../services/chunk.service.js";
import ChatMessage from "../models/chatHistory.model.js";

// SSE streaming endpoint
export async function streamResponse(req, res) {
  const userQuery = req.query.query;
  const sessionId = req.query.sessionId || req.headers["x-session-id"] || "anonymous";
  if (!userQuery) return res.status(400).send("Query is required");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  let ended = false;

  const safeWrite = (data) => {
    if (!res.writableEnded && !ended) res.write(`data: ${data}\n\n`);
  };

  const safeEnd = () => {
    if (!res.writableEnded && !ended) {
      ended = true;
      res.write(`data: [DONE]\n\n`);
      res.end();
    }
  };

  try {
    const chunks = await getTopChunks(userQuery, 3);
    // If nothing is retrieved at all, clearly say we have no matching context.
    if (!chunks.length) {
      safeWrite(
        JSON.stringify({
          text: "I couldn't find relevant information in the uploaded documents for this question.",
          citation: [],
        })
      );
      return safeEnd();
    }

    const finalAnswer = await streamLLMResponse(userQuery, chunks, safeWrite);
    // persist chat history
    await ChatMessage.create({ sessionId, role: "user", content: userQuery });
    await ChatMessage.create({
      sessionId,
      role: "assistant",
      content: finalAnswer,
      citations: chunks.map((c) => ({ source: c.source, page: c.page })),
    });
    safeEnd();
  } catch (err) {
    console.error("Streaming error:", err);
    safeWrite(JSON.stringify({ text: "Error occurred", citation: [] }));
    safeEnd();
  }
}

// Normal POST chat response
export async function chatResponse(req, res) {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: "Message is required" });

    const chunks = await getTopChunks(message, 3);
    const replyText = chunks.length
      ? chunks.map((c) => c.text).join(" ")
      : "I couldn't find relevant information in the uploaded documents for this question.";

    res.json({ reply: replyText });
  } catch (err) {
    console.error("POST chat error:", err);
    res.status(500).json({ reply: "Something went wrong" });
  }
}
