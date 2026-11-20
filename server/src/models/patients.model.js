import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0, max: 130 },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    phone: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    condition: {
      type: String,
      enum: ["Stable", "Monitoring", "Critical", "Recovering"],
      default: "Stable",
    },
    admissionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    notes: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);
//===========================================
// INDEXING FOR THE FAST LOADING DATA
//===========================================
patientSchema.index({ doctorId: 1, createdAt: -1 });
patientSchema.index({ condition: 1, admissionDate: -1 });
patientSchema.index({ admissionDate: -1 });
patientSchema.index({
  name: "text",
  phone: "text",
  email: "text",
  notes: "text",
});

export const Patient =
  mongoose.models.Patient || mongoose.model("Patient", patientSchema);
