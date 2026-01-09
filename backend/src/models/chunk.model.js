// import mongoose from "mongoose";

// const chunkSchema = new mongoose.Schema(
//   {
//     text: {
//       type: String,
//       required: true,
//     },
//     source: {
//       type: String, // PDF filename
//       required: true,
//     },
//     page: {
//       type: Number,
//     },
//     vector: {
//       type: [Number], // Array of numbers (embedding)
//       required: true,
//     },
//   },
//   { timestamps: true }
// );


// export default mongoose.model("Chunk", chunkSchema);
// import cohere from "cohere-ai";

// cohere.init({
//   apiKey: process.env.COHERE_API_KEY,
// });

// export async function generateEmbedding(text) {
//   const response = await cohere.embed({
//     model: "embed-english-v3.0",
//     texts: [text],
//     input_type: "search_document",
//   });

//   return response.embeddings[0]; // ✅ 1024-d vector
// }
import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    source: { type: String, required: true },
    page: { type: Number },
    vector: { type: [Number], required: true },
  },
  { timestamps: true }
);

// Atlas Vector Search index
chunkSchema.index({ vector: "vectorSearch" });

export default mongoose.model("Chunk", chunkSchema);

