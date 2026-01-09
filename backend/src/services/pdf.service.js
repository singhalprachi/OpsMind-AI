// import fs from "fs";


// import pdf from "pdf-parse";
// import Chunk from "../models/chunk.model.js";
// import { generateEmbedding } from "./embed.service.js";

// export async function processPDF(filePath, filename) {
//   const buffer = fs.readFileSync(filePath);
//   const data = await pdf(buffer);

//   const text = data.text;

//   const chunkSize = 500;
//   let pageNumber = 1;

//   for (let i = 0; i < text.length; i += chunkSize) {
//     const chunkText = text.slice(i, i + chunkSize);

//     const embedding = await generateEmbedding(chunkText);

//     await Chunk.create({
//       chunk: chunkText,
//       embedding,              // ✅ 1536 vector
//       filename,
//       page: pageNumber,
//     });
//   }

//   console.log("PDF ingested successfully");
// }
import fs from "fs";
import path from "path";
import "dotenv/config";
import pdf from "pdf-parse";
import { splitIntoChunks, storeChunks } from "./chunk.service.js";

export async function processMultiplePDFs(filePaths) {
  try {
    let combinedText = "";

    for (const filePath of filePaths) {
      if (!fs.existsSync(filePath)) {
        console.warn("⚠️ File not found:", filePath);
        continue;
      }

      const buffer = fs.readFileSync(filePath);
      const data = await pdf(buffer);

      if (data.text && data.text.trim().length > 0) {
        const normalizedText = data.text.replace(/\s+/g, " ").trim();
        const chunks = splitIntoChunks(normalizedText, 1000, 200);
        const sourceName = path.basename(filePath);
        await storeChunks(chunks, sourceName || "uploaded.pdf");
        combinedText += normalizedText + " ";
      } else {
        console.warn(`⚠️ PDF '${filePath.split("/").pop()}' has no extractable text.`);
      }
    }

    if (!combinedText.trim()) {
      console.warn("⚠️ No text found in any PDFs. Skipping ingestion.");
      return "";
    }

    console.log("✅ PDFs ingested with embeddings using 1000-char overlapping chunks.");
    return combinedText.trim();
  } catch (err) {
    console.error("❌ Failed to process multiple PDFs:", err.message);
    return "";
  }
}
