import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    citations: [{ source: String, page: Number }],
  },
  { timestamps: true }
);

export default mongoose.model("ChatMessage", chatMessageSchema);
