import mongoose from "mongoose";
import { Doctor } from "../models/doctors.model.js";
import { Patient } from "../models/patients.model.js";

function buildDateRange(startDate, endDate, field = "createdAt") {
  if (!startDate && !endDate) return null;
  const range = {};
  if (startDate) {
    range.$gte = new Date(`${startDate}T00:00:00.000Z`);
  }
  if (endDate) {
    range.$lte = new Date(`${endDate}T23:59:59.999Z`);
  }
  return { [field]: range };
}

//===============================
// GET ALL DOCTORS
//===============================
export async function all_doctors_controller(req, res, next) {
  try {
    const {
      search = "",
      specialization = "",
      hospital = "",
      startDate = "",
      endDate = "",
      page = "1",
      limit = "6",
    } = req.query;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(
      50,
      Math.max(1, parseInt(String(limit), 10) || 6),
    );
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (String(specialization).trim()) {
      filter.specialization = String(specialization).trim();
    }

    if (String(hospital).trim()) {
      filter.hospital = String(hospital).trim();
    }

    const dateFilter = buildDateRange(
      String(startDate).trim(),
      String(endDate).trim(),
      "createdAt",
    );
    if (dateFilter) {
      Object.assign(filter, dateFilter);
    }

    const trimmedSearch = String(search).trim();
    if (trimmedSearch) {
      const regex = new RegExp(
        trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
      filter.$or = [
        { name: regex },
        { specialization: regex },
        { hospital: regex },
        { phone: regex },
        { email: regex },
      ];
    }

    const [total, doctors] = await Promise.all([
      Doctor.countDocuments(filter),
      Doctor.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    const doctorIds = doctors.map((d) => d._id);
    const patients = doctorIds.length
      ? await Patient.find({ doctorId: { $in: doctorIds } })
          .sort({ admissionDate: -1, createdAt: -1 })
          .lean()
      : [];

    const patientsByDoctor = new Map();
    for (const pt of patients) {
      const key = pt.doctorId.toString();
      if (!patientsByDoctor.has(key)) {
        patientsByDoctor.set(key, []);
      }
      patientsByDoctor.get(key).push({
        id: pt._id.toString(),
        name: pt.name,
        age: pt.age,
        gender: pt.gender,
        phone: pt.phone,
        email: pt.email || "",
        condition: pt.condition,
        admissionDate: pt.admissionDate
          ? new Date(pt.admissionDate).toISOString().slice(0, 10)
          : "",
        notes: pt.notes || "",
      });
    }

    const items = doctors.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      specialization: doc.specialization,
      hospital: doc.hospital,
      phone: doc.phone,
      email: doc.email,
      joinedDate: doc.createdAt
        ? new Date(doc.createdAt).toISOString().slice(0, 10)
        : "",
      patients: patientsByDoctor.get(doc._id.toString()) || [],
    }));

    return res.status(200).json({
      success: true,
      data: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.max(1, Math.ceil(total / limitNum)),
      },
    });
  } catch (error) {
    next(error);
  }
}

//===============================
// CREATE DOCTORS
//===============================
export async function create_doctors_controller(req, res, next) {
  try {
    const { name, specialization, hospital, phone, email } = req.body;

    if (!name || !specialization || !hospital || !phone || !email) {
      return res.status(400).json({
        success: false,
        message:
          "Name, specialization, hospital, phone, and email are required",
      });
    }

    const doc = await Doctor.create({
      name: String(name).trim(),
      specialization: String(specialization).trim(),
      hospital: String(hospital).trim(),
      phone: String(phone).trim(),
      email: String(email).toLowerCase().trim(),
    });

    return res.status(201).json({
      success: true,
      data: {
        id: doc._id.toString(),
        name: doc.name,
        specialization: doc.specialization,
        hospital: doc.hospital,
        phone: doc.phone,
        email: doc.email,
        joinedDate: new Date(doc.createdAt).toISOString().slice(0, 10),
        patients: [],
      },
    });
  } catch (error) {
    next(error);
  }
}

//===============================
// UPDATE DOCTORS
//===============================
export async function update_doctors_controller(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid doctor ID" });
    }

    const updates = {};
    for (const field of ["name", "specialization", "hospital", "phone"]) {
      if (req.body[field] !== undefined) {
        updates[field] = String(req.body[field]).trim();
      }
    }
    if (req.body.email !== undefined) {
      updates.email = String(req.body.email).toLowerCase().trim();
    }

    const updated = await Doctor.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: updated._id.toString(),
        name: updated.name,
        specialization: updated.specialization,
        hospital: updated.hospital,
        phone: updated.phone,
        email: updated.email,
        joinedDate: new Date(updated.createdAt).toISOString().slice(0, 10),
      },
    });
  } catch (error) {
    next(error);
  }
}

//===============================
// DELETE DOCTORS
//===============================
export async function delete_doctors_controller(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid doctor ID" });
    }

    const deleted = await Doctor.findByIdAndDelete(id).lean();
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor deleted",
    });
  } catch (error) {
    next(error);
  }
}

//===============================
// ASSIGN PATIENT TO DOCTORS
//===============================
export async function assign_patient_todoctor_controller(req, res, next) {
  try {
    const { doctor_id: id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid doctor ID" });
    }

    const doctor = await Doctor.findById(id).lean();
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    const { name, age, gender, phone, email, condition, admissionDate, notes } =
      req.body;

    if (!name || age === undefined || !gender || !phone) {
      return res.status(400).json({
        success: false,
        message: "Patient name, age, gender, and phone are required",
      });
    }

    const patient = await Patient.create({
      name: String(name).trim(),
      age: Number(age),
      gender,
      phone: String(phone).trim(),
      email: email ? String(email).toLowerCase().trim() : undefined,
      doctorId: doctor._id,
      condition: condition || "Stable",
      admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
      notes: notes ? String(notes).trim() : undefined,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: patient._id.toString(),
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email || "",
        doctorId: doctor._id.toString(),
        doctorName: doctor.name,
        condition: patient.condition,
        admissionDate: new Date(patient.admissionDate)
          .toISOString()
          .slice(0, 10),
        notes: patient.notes || "",
      },
    });
  } catch (error) {
    next(error);
  }
}

//===============================
// DELETE  PATIENT FROM DOCTORS
//===============================
export async function delete_patient_from_doctors_controller(req, res, next) {
  try {
    const { doctorId, patientId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(doctorId) ||
      !mongoose.Types.ObjectId.isValid(patientId)
    ) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const removed = await Patient.findOneAndDelete({
      _id: patientId,
      doctorId,
    }).lean();

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: "Assigned patient not found for this doctor",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient removed from doctor's list",
    });
  } catch (error) {
    next(error);
  }
}
