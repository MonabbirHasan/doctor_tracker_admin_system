import { Router } from "express";
import {
  all_patients_controller,
  create_patients_controller,
  delete_patients_controller,
  update_patients_controller,
} from "../controllers/patients.controller.js";
import { protectAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protectAdmin);

router.get("/all", all_patients_controller);
router.post("/create", create_patients_controller);
router.put("/update/:id", update_patients_controller);
router.delete("/delete/:id", delete_patients_controller);

export default router;
