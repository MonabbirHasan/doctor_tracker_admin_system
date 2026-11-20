import { Router } from "express";
import {
  admin_login_controller,
  current_admin_controller,
  initialize_admin_controller,
} from "../controllers/users.controller.js";
import { protectAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", admin_login_controller);
router.post("/seed-admin", initialize_admin_controller);
router.get("/me", protectAdmin, current_admin_controller);

export default router;
