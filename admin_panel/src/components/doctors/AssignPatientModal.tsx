"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    X,
    UserPlus,
    Stethoscope,
    Phone,
    Mail,
    HeartPulse,
    Calendar,
    FileText,
    Loader2,
    Building2,
} from "lucide-react";
import "./assignpatientmodal.css";

export type PatientCondition = "Stable" | "Monitoring" | "Critical" | "Recovering";
export type PatientGender = "Male" | "Female" | "Other";

export interface TargetDoctorSummary {
    id?: string;
    _id?: string;
    name: string;
    specialization: string;
    hospital?: string;
}

export interface AssignPatientFormValues {
    name: string;
    age: number;
    gender: PatientGender;
    phone: string;
    email?: string;
    condition: PatientCondition;
    admissionDate: string;
    notes?: string;
}

interface AssignPatientModalProps {
    isOpen: boolean;
    doctor: TargetDoctorSummary | null;
    isSubmitting?: boolean;
    onClose: () => void;
    onAssignPatient: (payload: AssignPatientFormValues & { doctorId: string }) => Promise<void> | void;
}
//=========================
// PATIENT FORM VALIDATION
//=========================

export const patientSchema: any = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Patient full name must be at least 2 characters")
        .max(100, "Name is too long"),
    age: z.preprocess(
        (val) => {
            if (val === "" || val === null || val === undefined) return NaN;
            if (typeof val === "number") return val;
            return Number(String(val).trim());
        },
        z
            .number({ message: "Age must be a number" })
            .int("Age must be a whole number")
            .min(0, "Age cannot be negative")
            .max(130, "Please enter a valid age")
    ),
    gender: z.enum(["Male", "Female", "Other"], {
        message: "Please select gender",
    }),
    phone: z
        .string()
        .trim()
        .min(7, "Please enter a valid phone number")
        .max(25, "Phone number is too long"),
    email: z
        .string()
        .trim()
        .email("Please enter a valid email address")
        .optional()
        .or(z.literal("")),
    condition: z.enum(["Stable", "Monitoring", "Critical", "Recovering"], {
        message: "Please select patient condition",
    }),
    admissionDate: z.string().min(1, "Please select an admission/visit date"),
    notes: z
        .string()
        .trim()
        .max(500, "Notes must be under 500 characters")
        .optional(),
});
//=========================
// DATE FORMATER
//=========================
const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
//=========================
// RENDER MAIL EMENT
//=========================
const AssignPatientModal: React.FC<AssignPatientModalProps> = ({
    isOpen,
    doctor,
    isSubmitting = false,
    onClose,
    onAssignPatient,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AssignPatientFormValues>({
        resolver: zodResolver(patientSchema),
        defaultValues: {
            name: "",
            age: 30,
            gender: "Male",
            phone: "",
            email: "",
            condition: "Stable",
            admissionDate: getTodayDateString(),
            notes: "",
        },
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                name: "",
                age: 30,
                gender: "Male",
                phone: "",
                email: "",
                condition: "Stable",
                admissionDate: getTodayDateString(),
                notes: "",
            });
        }
    }, [isOpen, doctor, reset]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isSubmitting) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isSubmitting, onClose]);

    if (!isOpen || !doctor) {
        return null;
    }

    const handleFormSubmit = async (values: AssignPatientFormValues | any) => {
        const rawId = doctor.id ?? doctor._id;
        const resolvedDoctorId = typeof rawId === "string" ? rawId.trim() : "";

        if (!resolvedDoctorId || resolvedDoctorId === "[object Object]") {
            return;
        }

        await onAssignPatient({
            ...values,
            email: values.email?.trim() ? values.email.trim() : undefined,
            doctorId: resolvedDoctorId,
        });
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="assign_patient_modal_title"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isSubmitting) {
                    onClose();
                }
            }}
            className="assignpatientmodal_backdrop_div fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
            <div className="assignpatientmodal_dialog_div w-full max-w-xl my-auto overflow-hidden">
                {/* Modal Header */}
                <div className="assignpatientmodal_header_div flex items-center justify-between gap-3 px-6 py-4 border-b border-slate-100">
                    <div className="assignpatientmodal_titlegroup_div flex items-center gap-3">
                        <div className="assignpatientmodal_iconbox_div w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <UserPlus className="assignpatientmodal_titleicon_svg w-5 h-5" />
                        </div>
                        <div className="assignpatientmodal_titles_div">
                            <h2
                                id="assign_patient_modal_title"
                                className="assignpatientmodal_title_h2 text-lg font-bold tracking-tight text-slate-900"
                            >
                                Assign New Patient
                            </h2>
                            <p className="assignpatientmodal_subtitle_p text-xs text-slate-500">
                                Add a patient record directly under this specialist
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Close modal"
                        className="assignpatientmodal_closebtn_button p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
                    >
                        <X className="assignpatientmodal_closesvg_svg w-5 h-5" />
                    </button>
                </div>

                {/* Target Doctor Context Banner */}
                <div className="assignpatientmodal_body_div p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                    <div className="assignpatientmodal_docbanner_div p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="assignpatientmodal_docinfo_div flex items-center gap-2.5">
                            <span className="assignpatientmodal_docbadge_span w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                                <Stethoscope className="assignpatientmodal_docicon_svg w-4 h-4" />
                            </span>
                            <div className="assignpatientmodal_doctext_div">
                                <span className="assignpatientmodal_doclabel_span text-[11px] font-semibold uppercase tracking-wider text-blue-700 block">
                                    Assigning To Doctor
                                </span>
                                <p className="assignpatientmodal_docname_p text-sm font-bold text-slate-900">
                                    {doctor.name}{" "}
                                    <span className="assignpatientmodal_docspec_span font-medium text-blue-600">
                                        • {doctor.specialization}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {doctor.hospital && (
                            <span className="assignpatientmodal_dochosp_span inline-flex items-center gap-1 text-xs text-slate-600 font-medium">
                                <Building2 className="assignpatientmodal_hospicon_svg w-3.5 h-3.5 text-slate-400" />
                                {doctor.hospital}
                            </span>
                        )}
                    </div>

                    {/* Patient Intake Form */}
                    <form
                        id="assign_patient_form"
                        onSubmit={handleSubmit(handleFormSubmit)}
                        className="assignpatientmodal_form_form space-y-4"
                        noValidate
                    >
                        {/* Full Name */}
                        <div className="assignpatientmodal_fieldgroup_div space-y-1.5">
                            <label
                                htmlFor="patient_name"
                                className="assignpatientmodal_label_label block text-xs sm:text-sm font-semibold text-slate-700"
                            >
                                Patient Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="patient_name"
                                type="text"
                                placeholder="e.g., Tanvir Ahmed"
                                {...register("name")}
                                className={`assignpatientmodal_field_input w-full px-3.5 py-2 text-sm ${errors.name ? "assignpatientmodal_field_error_input" : ""
                                    }`}
                            />
                            {errors.name && (
                                <p className="assignpatientmodal_error_p text-xs font-medium text-red-600">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        {/* Age & Gender Row */}
                        <div className="assignpatientmodal_row_div grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="assignpatientmodal_fieldgroup_div space-y-1.5">
                                <label
                                    htmlFor="patient_age"
                                    className="assignpatientmodal_label_label block text-xs sm:text-sm font-semibold text-slate-700"
                                >
                                    Age (Years) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="patient_age"
                                    type="number"
                                    min={0}
                                    max={130}
                                    {...register("age", { valueAsNumber: true })}
                                    className={`assignpatientmodal_field_input w-full px-3.5 py-2 text-sm tabular-nums ${errors.age ? "assignpatientmodal_field_error_input" : ""
                                        }`}
                                />
                                {errors.age && (
                                    <p className="assignpatientmodal_error_p text-xs font-medium text-red-600">
                                        {errors.age.message}
                                    </p>
                                )}
                            </div>

                            <div className="assignpatientmodal_fieldgroup_div space-y-1.5">
                                <label
                                    htmlFor="patient_gender"
                                    className="assignpatientmodal_label_label block text-xs sm:text-sm font-semibold text-slate-700"
                                >
                                    Gender <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="patient_gender"
                                    {...register("gender")}
                                    className={`assignpatientmodal_field_select w-full px-3.5 py-2 text-sm ${errors.gender ? "assignpatientmodal_field_error_select" : ""
                                        }`}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.gender && (
                                    <p className="assignpatientmodal_error_p text-xs font-medium text-red-600">
                                        {errors.gender.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Phone & Email Row */}
                        <div className="assignpatientmodal_row_div grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="assignpatientmodal_fieldgroup_div space-y-1.5">
                                <label
                                    htmlFor="patient_phone"
                                    className="assignpatientmodal_label_label block text-xs sm:text-sm font-semibold text-slate-700"
                                >
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <div className="assignpatientmodal_inputwrap_div relative">
                                    <Phone className="assignpatientmodal_inputicon_svg w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        id="patient_phone"
                                        type="tel"
                                        placeholder="+880 17XX-XXXXXX"
                                        {...register("phone")}
                                        className={`assignpatientmodal_field_input w-full pl-9 pr-3.5 py-2 text-sm ${errors.phone ? "assignpatientmodal_field_error_input" : ""
                                            }`}
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="assignpatientmodal_error_p text-xs font-medium text-red-600">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>

                            <div className="assignpatientmodal_fieldgroup_div space-y-1.5">
                                <label
                                    htmlFor="patient_email"
                                    className="assignpatientmodal_label_label block text-xs sm:text-sm font-semibold text-slate-700"
                                >
                                    Email <span className="text-slate-400 font-normal">(Optional)</span>
                                </label>
                                <div className="assignpatientmodal_inputwrap_div relative">
                                    <Mail className="assignpatientmodal_inputicon_svg w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        id="patient_email"
                                        type="email"
                                        placeholder="patient@example.com"
                                        {...register("email")}
                                        className={`assignpatientmodal_field_input w-full pl-9 pr-3.5 py-2 text-sm ${errors.email ? "assignpatientmodal_field_error_input" : ""
                                            }`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="assignpatientmodal_error_p text-xs font-medium text-red-600">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Condition & Admission Date Row */}
                        <div className="assignpatientmodal_row_div grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="assignpatientmodal_fieldgroup_div space-y-1.5">
                                <label
                                    htmlFor="patient_condition"
                                    className="assignpatientmodal_label_label block text-xs sm:text-sm font-semibold text-slate-700"
                                >
                                    Patient Condition <span className="text-red-500">*</span>
                                </label>
                                <div className="assignpatientmodal_inputwrap_div relative">
                                    <HeartPulse className="assignpatientmodal_inputicon_svg w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <select
                                        id="patient_condition"
                                        {...register("condition")}
                                        className={`assignpatientmodal_field_select w-full pl-9 pr-3.5 py-2 text-sm ${errors.condition
                                            ? "assignpatientmodal_field_error_select"
                                            : ""
                                            }`}
                                    >
                                        <option value="Stable">Stable</option>
                                        <option value="Monitoring">Monitoring</option>
                                        <option value="Critical">Critical</option>
                                        <option value="Recovering">Recovering</option>
                                    </select>
                                </div>
                                {errors.condition && (
                                    <p className="assignpatientmodal_error_p text-xs font-medium text-red-600">
                                        {errors.condition.message}
                                    </p>
                                )}
                            </div>

                            <div className="assignpatientmodal_fieldgroup_div space-y-1.5">
                                <label
                                    htmlFor="patient_admission_date"
                                    className="assignpatientmodal_label_label block text-xs sm:text-sm font-semibold text-slate-700"
                                >
                                    Visit / Admission Date <span className="text-red-500">*</span>
                                </label>
                                <div className="assignpatientmodal_inputwrap_div relative">
                                    <Calendar className="assignpatientmodal_inputicon_svg w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        id="patient_admission_date"
                                        type="date"
                                        {...register("admissionDate")}
                                        className={`assignpatientmodal_field_input w-full pl-9 pr-3.5 py-2 text-sm ${errors.admissionDate
                                            ? "assignpatientmodal_field_error_input"
                                            : ""
                                            }`}
                                    />
                                </div>
                                {errors.admissionDate && (
                                    <p className="assignpatientmodal_error_p text-xs font-medium text-red-600">
                                        {errors.admissionDate.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Clinical Notes */}
                        <div className="assignpatientmodal_fieldgroup_div space-y-1.5">
                            <label
                                htmlFor="patient_notes"
                                className="assignpatientmodal_label_label flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700"
                            >
                                <span className="assignpatientmodal_notelabel_span inline-flex items-center gap-1.5">
                                    <FileText className="assignpatientmodal_noteicon_svg w-3.5 h-3.5 text-slate-400" />
                                    Symptoms / Clinical Notes
                                </span>
                                <span className="assignpatientmodal_opt_span text-xs font-normal text-slate-400">
                                    Optional
                                </span>
                            </label>
                            <textarea
                                id="patient_notes"
                                rows={3}
                                placeholder="Brief chief complaint, allergies, or follow-up instructions..."
                                {...register("notes")}
                                className={`assignpatientmodal_field_textarea w-full px-3.5 py-2 text-sm resize-none ${errors.notes ? "assignpatientmodal_field_error_textarea" : ""
                                    }`}
                            />
                            {errors.notes && (
                                <p className="assignpatientmodal_error_p text-xs font-medium text-red-600">
                                    {errors.notes.message}
                                </p>
                            )}
                        </div>
                    </form>
                </div>

                {/* Modal Footer */}
                <div className="assignpatientmodal_footer_div flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50/70 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="assignpatientmodal_cancelbtn_button px-4 py-2 text-xs sm:text-sm font-semibold cursor-pointer disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        form="assign_patient_form"
                        disabled={isSubmitting}
                        className="assignpatientmodal_submitbtn_button inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold cursor-pointer disabled:opacity-60"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="assignpatientmodal_spin_svg w-4 h-4 animate-spin" />
                                <span className="assignpatientmodal_submittext_span">
                                    Assigning...
                                </span>
                            </>
                        ) : (
                            <>
                                <UserPlus className="assignpatientmodal_submiticon_svg w-4 h-4" />
                                <span className="assignpatientmodal_submittext_span">
                                    Assign Patient
                                </span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignPatientModal;