import { Router } from "express";
import { get_analytics_controller } from "../controllers/analytics.controller.js";
import { protectAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protectAdmin);
router.get("/overview", get_analytics_controller);

export default router;
