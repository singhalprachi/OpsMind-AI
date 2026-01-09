// import express from "express";
// import multer from "multer";
// import path from "path";

// const router = express.Router();

// /* ---------- Multer config ---------- */
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (path.extname(file.originalname).toLowerCase() !== ".pdf") {
//     // Pass a custom error object instead of plain Error
//     cb(null, false); // reject the file silently
//     req.fileValidationError = "Only PDF files allowed"; // attach error
//   } else {
//     cb(null, true); // accept the file
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
// });

// /* ---------- API ---------- */
// router.post("/upload", upload.single("file"), (req, res) => {
//   // File type error
//   if (req.fileValidationError) {
//     return res.status(400).json({ message: req.fileValidationError });
//   }

//   // No file uploaded
//   if (!req.file) {
//     return res.status(400).json({ message: "No file uploaded" });
//   }

//   res.status(200).json({
//     message: "PDF uploaded successfully",
//     fileName: req.file.originalname,
//     savedAs: req.file.filename,
//   });
// });

// import express from "express";
// import express from "express";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { processMultiplePDFs } from "../services/pdf.service.js"; // multi-PDF text processing

// const router = express.Router();

// // Upload folder
// const uploadDir = path.join(process.cwd(), "src/uploads");
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// // Multer storage config
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) => {
//     const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
//     cb(null, `${Date.now()}-${safeName}`);
//   },
// });

// // Only allow PDFs
// const fileFilter = (req, file, cb) => {
//   if (path.extname(file.originalname).toLowerCase() !== ".pdf") {
//     req.fileValidationError = "Only PDF files allowed";
//     cb(null, false);
//   } else {
//     cb(null, true);
//   }
// };

// const upload = multer({ storage, fileFilter });

// // --- Single PDF upload: POST /api/upload ---
// router.post("/", upload.single("pdf"), async (req, res) => {
//   try {
//     if (req.fileValidationError) return res.status(400).json({ message: req.fileValidationError });
//     if (!req.file) return res.status(400).json({ message: "No file uploaded" });

//     const filePath = req.file.path;

//     // Process single PDF as array for processMultiplePDFs
//     const combinedText = await processMultiplePDFs([filePath]);

//     // Save extracted text to .txt
//     const txtPath = path.join(uploadDir, `text_${Date.now()}.txt`);
//     fs.writeFileSync(txtPath, combinedText, "utf-8");

//     res.status(200).json({
//       message: "✅ PDF uploaded & text extracted successfully",
//       uploadedFile: req.file.filename,
//       textFile: txtPath,
//     });
//   } catch (err) {
//     console.error("❌ PDF upload failed:", err);
//     res.status(500).json({ message: "PDF processing failed", error: err.message });
//   }
// });

// // --- Multiple PDF upload: POST /api/upload-multiple ---
// router.post("/upload-multiple", upload.array("files", 10), async (req, res) => {
//   try {
//     if (req.fileValidationError) return res.status(400).json({ message: req.fileValidationError });
//     if (!req.files || req.files.length === 0) return res.status(400).json({ message: "No files uploaded" });

//     const filePaths = req.files.map(f => f.path);

//     const combinedText = await processMultiplePDFs(filePaths);

//     const txtPath = path.join(uploadDir, `merged_${Date.now()}.txt`);
//     fs.writeFileSync(txtPath, combinedText, "utf-8");

//     res.status(200).json({
//       message: "✅ PDFs uploaded & text extracted successfully",
//       uploadedFiles: req.files.map(f => f.filename),
//       textFile: txtPath,
//     });
//   } catch (err) {
//     console.error("❌ Multi-PDF upload failed:", err);
//     res.status(500).json({ message: "PDF processing failed", error: err.message });
//   }
// });

// export default router;
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { processMultiplePDFs } from "../services/pdf.service.js";
import Chunk from "../models/chunk.model.js";

const router = express.Router();

// Upload folder
const uploadDir = path.join(process.cwd(), "src/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

// Only allow PDFs
const fileFilter = (req, file, cb) => {
  if (path.extname(file.originalname).toLowerCase() !== ".pdf") {
    req.fileValidationError = "Only PDF files allowed";
    cb(null, false);
  } else {
    cb(null, true);
  }
};

const upload = multer({ storage, fileFilter });

// --- Single PDF upload: POST /api/upload ---
router.post("/", upload.single("pdf"), async (req, res) => {
  try {
    if (req.fileValidationError)
      return res.status(400).json({ message: req.fileValidationError });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const filePath = req.file.path;

    // ❗ Clear old chunks so retrieval is always scoped to the latest upload.
    // This avoids mixing answers from previous PDFs like SDE_MERN_PROJECT_DOC.pdf.
    const beforeClear = await Chunk.countDocuments();
    await Chunk.deleteMany({});
    console.log("🧹 Cleared old chunks before new upload. Removed:", beforeClear);

    // See how many chunks existed before this upload
    const beforeCount = await Chunk.countDocuments();
    console.log("📥 Starting ingestion for file:", filePath, "existing chunks:", beforeCount);

    // Process single PDF as array for processMultiplePDFs
    const combinedText = await processMultiplePDFs([filePath]);

    const afterCount = await Chunk.countDocuments();
    const inserted = afterCount - beforeCount;
    console.log("✅ Ingestion finished. New chunks inserted:", inserted);

    const txtPath = path.join(uploadDir, `text_${Date.now()}.txt`);
    fs.writeFileSync(txtPath, combinedText, "utf-8");

    res.status(200).json({
      message: "✅ PDF uploaded & text extracted successfully",
      uploadedFile: req.file.filename,
      textFile: txtPath,
      totalChunks: afterCount,
      newChunks: inserted,
    });
  } catch (err) {
    console.error("❌ PDF upload failed:", err);
    res
      .status(500)
      .json({ message: "PDF processing failed", error: err.message });
  }
});

// --- Multiple PDF upload: POST /api/upload-multiple ---
router.post("/upload-multiple", upload.array("files", 10), async (req, res) => {
  try {
    if (req.fileValidationError)
      return res.status(400).json({ message: req.fileValidationError });
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "No files uploaded" });

    const filePaths = req.files.map((f) => f.path);

    // Same behavior: treat this as the new active document set.
    const beforeClear = await Chunk.countDocuments();
    await Chunk.deleteMany({});
    console.log("🧹 Cleared old chunks before multi-upload. Removed:", beforeClear);

    const beforeCount = await Chunk.countDocuments();
    console.log(
      "📥 Starting multi-PDF ingestion. Files:",
      filePaths,
      "existing chunks:",
      beforeCount
    );

    const combinedText = await processMultiplePDFs(filePaths);

    const afterCount = await Chunk.countDocuments();
    const inserted = afterCount - beforeCount;
    console.log("✅ Multi-PDF ingestion finished. New chunks inserted:", inserted);

    const txtPath = path.join(uploadDir, `merged_${Date.now()}.txt`);
    fs.writeFileSync(txtPath, combinedText, "utf-8");

    res.status(200).json({
      message: "✅ PDFs uploaded & text extracted successfully",
      uploadedFiles: req.files.map((f) => f.filename),
      textFile: txtPath,
      totalChunks: afterCount,
      newChunks: inserted,
    });
  } catch (err) {
    console.error("❌ Multi-PDF upload failed:", err);
    res
      .status(500)
      .json({ message: "PDF processing failed", error: err.message });
  }
});

export default router;

