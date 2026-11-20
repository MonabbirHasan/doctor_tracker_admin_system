import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import { errorHandler } from "./middlewares/errorHandler.js";
import path from "path";

import authRoutes from "./routes/users.routes.js";
import doctorRoutes from "./routes/doctors.routes.js";
import patientRoutes from "./routes/patients.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

const app = express();

app.use(helmet());
const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:3000,http://127.0.0.1:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (like Postman or server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || "http://localhost:5000",
//     credentials: true,
//   }),
// );
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.sendFile(path.resolve("src", "views", "index.html"));
});
app.get("/api/health", (_req, res) => {
  const readyState = mongoose.connection.readyState;
  const stateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.status(readyState === 1 ? 200 : 503).json({
    success: readyState === 1,
    database: stateMap[readyState] ?? "unknown",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

export default app;
