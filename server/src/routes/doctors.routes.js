import { Router } from "express";
import {
  all_doctors_controller,
  assign_patient_todoctor_controller,
  create_doctors_controller,
  delete_doctors_controller,
  delete_patient_from_doctors_controller,
  update_doctors_controller,
} from "../controllers/doctors.controller.js";
import { protectAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protectAdmin);

router.get("/all", all_doctors_controller);
router.post("/create", create_doctors_controller);
router.put("/update/:id", update_doctors_controller);
router.delete("/delete/:id", delete_doctors_controller);
router.post("/assign_patient/:doctor_id", assign_patient_todoctor_controller);
router.delete(
  "/delete/:doctorId/patients/:patientId",
  delete_patient_from_doctors_controller,
);

export default router;
