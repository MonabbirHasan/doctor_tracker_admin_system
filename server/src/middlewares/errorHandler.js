import mongoose from "mongoose";

export function errorHandler(err, _req, res, _next) {
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      message: `Invalid value for ${err.path}`,
    });
  }

  if (err && typeof err === "object" && err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A record with that unique value already exists.",
    });
  }

  console.error("[Server Error]", err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
