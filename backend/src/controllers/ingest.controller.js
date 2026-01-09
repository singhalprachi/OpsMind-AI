// import { parsePDF } from "../services/pdf.service.js";
// import { createChunks } from "../services/chunk.service.js";
// import Chunk from "../models/chunk.model.js";

// export async function ingestPDF(req, res) {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     const text = await parsePDF(req.file.path);
//     const chunks = await createChunks(text, req.file.originalname);
//     await Chunk.insertMany(chunks);

//     res.json({
//       message: "PDF ingested successfully",
//       totalChunks: chunks.length
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "PDF ingestion failed" });
//   }
// }

import fs from "fs";
import { parsePDF } from "../services/pdf.service.js";
import { createChunks } from "../services/chunk.service.js";
import Chunk from "../models/chunk.model.js";

export async function ingestPDF(req, res) {
  try {
    // 1️⃣ File validation
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 2️⃣ VERY IMPORTANT: always use req.file.path
    const filePath = req.file.path;

    // 3️⃣ Parse PDF
    const text = await parsePDF(filePath);

    // 4️⃣ Create chunks
    const chunks = await createChunks(text, req.file.originalname);

    // 5️⃣ Save chunks to DB
    await Chunk.insertMany(chunks);

    // 6️⃣ Delete PDF after processing (best practice)
    fs.unlinkSync(filePath);

    res.json({
      message: "PDF ingested successfully",
      source: req.file.originalname,
      totalChunks: chunks.length
    });
  } catch (err) {
    console.error("PDF INGEST ERROR:", err);
    res.status(500).json({ error: "PDF ingestion failed" });
  }
}
