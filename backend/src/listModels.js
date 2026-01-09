import Groq from "groq-sdk";
import "dotenv/config";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function listModels() {
  try {
    const response = await groq.models.list(); // List available models
    console.log("Available models:", response);
  } catch (err) {
    console.error("Error listing models:", err);
  }
}

listModels();

