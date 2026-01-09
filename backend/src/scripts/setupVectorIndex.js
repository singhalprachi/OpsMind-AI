import "dotenv/config";
import mongoose from "mongoose";

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI is not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const collectionName = "chunks"; // default collection name for Chunk model

    // Optional: clear old chunks so you don't mix 1024‑dim and 1536‑dim vectors
    try {
      const col = db.collection(collectionName);
      const deleteResult = await col.deleteMany({});
      console.log(`🧹 Cleared existing documents from '${collectionName}' collection (${deleteResult.deletedCount} removed).`);
    } catch (err) {
      console.warn("⚠️ Could not clear existing chunks collection:", err.message);
    }

    // Try to drop existing Atlas Search index and any normal index with same name
    try {
      await db.command({
        dropSearchIndex: collectionName,
        name: "vector_index",
      });
      console.log("🗑️ Dropped existing 'vector_index' search index (if it existed).");
    } catch (err) {
      console.warn("⚠️ Could not drop existing search index (may not exist yet):", err.message);
    }

    try {
      await db.collection(collectionName).dropIndex("vector_index");
      console.log("🗑️ Dropped existing btree index named 'vector_index' (if it existed).");
    } catch (err) {
      if (err.codeName !== "IndexNotFound") {
        console.warn("⚠️ Could not drop normal index 'vector_index' (may not exist):", err.message);
      }
    }

    // Create new Atlas Search vector index for local 128‑dim embeddings
    try {
      const createResult = await db.command({
        createSearchIndexes: collectionName,
        indexes: [
          {
            name: "vector_index",
            definition: {
              mappings: {
                dynamic: false,
                fields: {
                  vector: {
                    type: "vector",
                    dimensions: 128,
                    similarity: "cosine",
                  },
                  text: {
                    type: "string",
                  },
                  source: {
                    type: "string",
                  },
                  page: {
                    type: "int",
                  },
                },
              },
            },
          },
        ],
      });

      console.log("✅ Created Atlas Search vector index:", JSON.stringify(createResult, null, 2));
    } catch (err) {
      if (err.codeName === "IndexAlreadyExists") {
        console.log("ℹ️ 'vector_index' already exists. Leaving existing definition in place.");
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error("❌ Error setting up vector index:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();

