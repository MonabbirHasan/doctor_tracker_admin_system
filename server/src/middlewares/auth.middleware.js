import jwt from "jsonwebtoken";
import { Admin } from "../models/users.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_in_production";

export async function protectAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: missing authentication token",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.id)
      .select("-passwordHash")
      .lean();

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: admin account not found",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: invalid or expired token",
    });
  }
}
