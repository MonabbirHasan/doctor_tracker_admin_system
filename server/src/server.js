import "dotenv/config";
import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";

const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "";

async function startServer() {
  try {
    await connectDB(MONGODB_URI);

    const server = app.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[Server] ${signal} received. Shutting down...`);
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("[Server] Failed to start:", error);
    process.exit(1);
  }
}

startServer();
