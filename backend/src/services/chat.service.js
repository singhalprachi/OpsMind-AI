import { callGroq } from "../groqTest.js";

/**
 * Streams Groq LLM response token by token via SSE
 * @param {string} userQuery - The user's question
 * @param {Array} chunks - Top relevant context chunks
 * @param {object} res - Express response object (SSE)
 */
export async function streamLLMResponse(userQuery, chunks, res) {
  const systemPrompt = `
You are an enterprise assistant. Use ONLY the provided context:
${chunks.join("\n\n")}
User question: ${userQuery}
If answer not found, say "I don't know."
`;

  try {
    const aiResponse = await callGroq(systemPrompt);

    // Stream token by token (simulate)
    const chunkSize = 50; // characters per chunk
    for (let i = 0; i < aiResponse.length; i += chunkSize) {
      const tokenChunk = aiResponse.slice(i, i + chunkSize);
      res.write(
        `data: ${JSON.stringify({ text: tokenChunk, citation: [] })}\n\n`
      );
      await new Promise((r) => setTimeout(r, 50)); // small delay for streaming effect
    }

    res.write(`data: ${JSON.stringify({ text: "[DONE]", citation: [] })}\n\n`);
  } catch (err) {
    console.error("Groq streaming error:", err);
    res.write(
      `data: ${JSON.stringify({ text: "Error occurred", citation: [] })}\n\n`
    );
  }
}

