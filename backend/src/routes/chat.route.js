import express from "express";
import { streamResponse, chatResponse } from "../controllers/chat.controller.js";

const router = express.Router();

console.log("✅ chat.route.js loaded");

// health check
router.get("/test", (req, res) => {
    res.send("Chat API is running ✅");
});

// 🔥 SSE streaming (GET)
router.get("/stream", streamResponse);

// normal chat (POST)
router.post("/", chatResponse);

export default router;




