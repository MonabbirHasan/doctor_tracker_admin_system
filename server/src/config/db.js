import mongoose from "mongoose";

let isConnected = false;

export async function connectDB(uri) {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!uri) {
    throw new Error("MONGODB_URI is missing in environment variables.");
  }

  mongoose.set("strictQuery", true);

  mongoose.connection.on("connected", () => {
    console.log("[MongoDB] Connected successfully");
  });

  mongoose.connection.on("error", (err) => {
    console.error("[MongoDB] Connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
    console.warn("[MongoDB] Disconnected");
  });

  const conn = await mongoose.connect(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  isConnected = true;
  return conn;
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log("[MongoDB] Connection closed cleanly");
  }
}