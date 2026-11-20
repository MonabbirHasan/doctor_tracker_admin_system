import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../models/users.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_in_production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function signToken(adminId) {
  return jwt.sign({ id: adminId, role: "admin" }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

//=================================
// ADMIN LOGIN CONTROLLER
//=================================
export async function admin_login_controller(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({
      email: String(email).toLowerCase().trim(),
    }).select("+passwordHash");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(String(password), admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = signToken(admin._id.toString());

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

//=================================
// ADMIN LOGIN INITIALIZATION convenience endpoint when no admin exists yet
//=================================
export async function initialize_admin_controller(req, res, next) {
  try {
    const existingCount = await Admin.countDocuments();
    if (existingCount > 0) {
      return res.status(409).json({
        success: false,
        message: "Admin account already exists",
      });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const admin = await Admin.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      passwordHash,
      role: "admin",
    });

    const token = signToken(admin._id.toString());

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

//=============================
// CURRENT ADMIN DETAILS
//=============================
export async function current_admin_controller(req, res) {
  return res.status(200).json({
    success: true,
    user: {
      id: req.admin._id.toString(),
      name: req.admin.name,
      email: req.admin.email,
      role: req.admin.role,
    },
  });
}
