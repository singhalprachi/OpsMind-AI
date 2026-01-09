// import dotenv from "dotenv";
// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import path from "path";

// import uploadRoutes from "./routes/upload.route.js";
// import chatRoutes from "./routes/chat.route.js";
// import { processMultiplePDFs } from "./services/pdf.service.js";

// dotenv.config();

// const app = express();

// // --- CORS middleware ---
// app.use(cors({
//   origin: "http://localhost:3000",
//   methods: ["GET", "POST"],
//   credentials: true,
// }));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // --- ROUTES ---
// // POST /api/upload
// app.use("/api/upload", uploadRoutes);

// // Chat routes
// app.use("/api/chat", chatRoutes);

// // --- PORT & MongoDB URI ---
// const PORT = process.env.PORT || 5000;
// const MONGO_URI = process.env.MONGO_URI;

// if (!MONGO_URI) {
//   console.error("❌ MongoDB URI is not defined in .env");
//   process.exit(1);
// }

// // --- Connect to MongoDB and start server ---
// mongoose
//   .connect(MONGO_URI)
//   .then(async () => {
//     console.log("✅ MongoDB Connected");

//     // 🔄 Process multiple PDFs on startup (optional)
//     const filePaths = [
//       path.join(process.cwd(), "src/uploads/1767613071941-Registration_for_Even_Sem_2025_26_date_extended_upto_8_Jan_2025.pdf")
//       path.join(process.cwd(), "src/uploads/1767794366663-SDE_MERN_PROJECT_DOC.pdf"),
// ];


//       await processMultiplePDFs(filePaths);
//       console.log("✅ Multiple PDFs ingested successfully");
//     } catch (err) {
//       console.error("❌ Error processing PDFs:", err.message);
//     }

//     // Start Express server
//     app.listen(PORT, () => {
//       console.log(`🚀 OpsMind AI backend running on port ${PORT}`);
//     });
//   })
//   .catch(err => {
//     console.error("❌ MongoDB Connection Error:", err);
//     process.exit(1);
//   });

// // --- Global error handler ---
// app.use((err, req, res, next) => {
//   console.error("❌ Global Error:", err);
//   res.status(500).json({ message: "Internal Server Error", error: err.message });
// });

import dotenv from "dotenv"; // <-- always first
dotenv.config();   
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";

import uploadRoutes from "./routes/upload.route.js";
import chatRoutes from "./routes/chat.route.js";
import { requireApiKey } from "./middleware/auth.middleware.js";



const app = express();

// --- CORS middleware ---
app.use(cors({
  origin: "https://coruscating-scone-e24166.netlify.app/",
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ROUTES ---
// POST /api/upload
app.use("/api/upload", requireApiKey, uploadRoutes);

// Chat routes
app.use("/api/chat", requireApiKey, chatRoutes);

// --- Root route ---
app.get("/", (req, res) => {
  res.send("🚀 OpsMind AI backend is running!");
});

// --- PORT & MongoDB URI ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MongoDB URI is not defined in .env");
  process.exit(1);
}

// --- Connect to MongoDB and start server ---
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 OpsMind AI backend running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// --- Global error handler ---
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});
