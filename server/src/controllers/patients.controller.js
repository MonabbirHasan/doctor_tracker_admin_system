import mongoose from "mongoose";
import { Patient } from "../models/patients.model.js";
import { Doctor } from "../models/doctors.model.js";

//=================================
// ALL PATIENTS
//=================================
export async function all_patients_controller(req, res, next) {
  try {
    const {
      search = "",
      condition = "",
      doctorId = "",
      startDate = "",
      endDate = "",
      page = "1",
      limit = "8",
    } = req.query;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(
      50,
      Math.max(1, parseInt(String(limit), 10) || 8),
    );
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (String(condition).trim()) {
      filter.condition = String(condition).trim();
    }

    if (String(doctorId).trim()) {
      if (!mongoose.Types.ObjectId.isValid(String(doctorId))) {
        return res.status(400).json({
          success: false,
          message: "Invalid doctorId filter",
        });
      }
      filter.doctorId = new mongoose.Types.ObjectId(String(doctorId));
    }

    if (startDate || endDate) {
      filter.admissionDate = {};
      if (startDate) {
        filter.admissionDate.$gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        filter.admissionDate.$lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    const trimmedSearch = String(search).trim();
    if (trimmedSearch) {
      const regex = new RegExp(
        trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
      const matchingDoctors = await Doctor.find({ name: regex })
        .select("_id")
        .lean();
      const matchingDocIds = matchingDoctors.map((d) => d._id);

      filter.$or = [
        { name: regex },
        { phone: regex },
        { email: regex },
        { condition: regex },
        { notes: regex },
        ...(matchingDocIds.length
          ? [{ doctorId: { $in: matchingDocIds } }]
          : []),
      ];
    }

    const [total, patients] = await Promise.all([
      Patient.countDocuments(filter),
      Patient.find(filter)
        .populate("doctorId", "name specialization hospital")
        .sort({ admissionDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    const items = patients.map((pt) => ({
      id: pt._id.toString(),
      name: pt.name,
      age: pt.age,
      gender: pt.gender,
      phone: pt.phone,
      email: pt.email || "",
      doctorId: pt.doctorId?._id ? pt.doctorId._id.toString() : "",
      doctorName: pt.doctorId?.name || "Unassigned Doctor",
      specialization: pt.doctorId?.specialization || "",
      condition: pt.condition,
      admissionDate: pt.admissionDate
        ? new Date(pt.admissionDate).toISOString().slice(0, 10)
        : "",
      notes: pt.notes || "",
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

//=================================
// CREATE PATIENTS
//=================================
export async function create_patients_controller(req, res, next) {
  try {
    const {
      name,
      age,
      gender,
      phone,
      email,
      doctorId,
      condition,
      admissionDate,
      notes,
    } = req.body;

    if (!name || age === undefined || !gender || !phone || !doctorId) {
      return res.status(400).json({
        success: false,
        message: "Name, age, gender, phone, and doctorId are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid doctorId" });
    }

    const doctor = await Doctor.findById(doctorId).lean();
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Assigned doctor not found" });
    }

    const created = await Patient.create({
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
        id: created._id.toString(),
        name: created.name,
        age: created.age,
        gender: created.gender,
        phone: created.phone,
        email: created.email || "",
        doctorId: doctor._id.toString(),
        doctorName: doctor.name,
        specialization: doctor.specialization,
        condition: created.condition,
        admissionDate: new Date(created.admissionDate)
          .toISOString()
          .slice(0, 10),
        notes: created.notes || "",
      },
    });
  } catch (error) {
    next(error);
  }
}

//=================================
// UPDATE PATIENTS
//=================================
export async function update_patients_controller(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid patient ID" });
    }

    const updates = {};
    if (req.body.name !== undefined)
      updates.name = String(req.body.name).trim();
    if (req.body.age !== undefined) updates.age = Number(req.body.age);
    if (req.body.gender !== undefined) updates.gender = req.body.gender;
    if (req.body.phone !== undefined)
      updates.phone = String(req.body.phone).trim();
    if (req.body.email !== undefined) {
      updates.email = req.body.email
        ? String(req.body.email).toLowerCase().trim()
        : "";
    }
    if (req.body.condition !== undefined)
      updates.condition = req.body.condition;
    if (req.body.admissionDate !== undefined) {
      updates.admissionDate = new Date(req.body.admissionDate);
    }
    if (req.body.notes !== undefined) {
      updates.notes = String(req.body.notes).trim();
    }
    if (req.body.doctorId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(req.body.doctorId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid doctorId" });
      }
      const doctorExists = await Doctor.exists({ _id: req.body.doctorId });
      if (!doctorExists) {
        return res
          .status(404)
          .json({ success: false, message: "Doctor not found" });
      }
      updates.doctorId = req.body.doctorId;
    }

    const updated = await Patient.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("doctorId", "name specialization")
      .lean();

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: updated._id.toString(),
        name: updated.name,
        age: updated.age,
        gender: updated.gender,
        phone: updated.phone,
        email: updated.email || "",
        doctorId: updated.doctorId?._id ? updated.doctorId._id.toString() : "",
        doctorName: updated.doctorId?.name || "Unassigned Doctor",
        specialization: updated.doctorId?.specialization || "",
        condition: updated.condition,
        admissionDate: updated.admissionDate
          ? new Date(updated.admissionDate).toISOString().slice(0, 10)
          : "",
        notes: updated.notes || "",
      },
    });
  } catch (error) {
    next(error);
  }
}

//=================================
// DELETE PATIENTS
//=================================
export async function delete_patients_controller(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid patient ID" });
    }

    const deleted = await Patient.findByIdAndDelete(id).lean();
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Patient deleted",
    });
  } catch (error) {
    next(error);
  }
}
