"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    X,
    UserRound,
    Stethoscope,
    Phone,
    Mail,
    HeartPulse,
    Calendar,
    FileText,
    Loader2,
    UserPlus,
    Save,
} from "lucide-react";
import "./patientformmodal.css";

export type PatientConditionType =
    | "Stable"
    | "Monitoring"
    | "Critical"
    | "Recovering";

export type PatientGenderType = "Male" | "Female" | "Other";

export interface DoctorOptionItem {
    id: string;
    name: string;
    specialization?: string;
}

export interface PatientFormValues {
    name: string;
    age: number;
    gender: PatientGenderType;
    phone: string;
    email?: string;
    doctorId: string;
    condition: PatientConditionType;
    admissionDate: string;
    notes?: string;
}

export interface EditablePatientRecord extends PatientFormValues {
    id: string;
}

interface PatientFormModalProps {
    isOpen: boolean;
    initialData?: EditablePatientRecord | null;
    doctors?: DoctorOptionItem[];
    isSubmitting?: boolean;
    onClose: () => void;
    onSubmitPatient: (
        values: PatientFormValues,
        patientId?: string
    ) => Promise<void> | void;
}

const DEFAULT_DOCTORS: DoctorOptionItem[] = [
    { id: "doc-1", name: "Dr. Farhana Rahman", specialization: "Cardiology" },
    { id: "doc-2", name: "Dr. Tariqul Islam", specialization: "Neurology" },
    { id: "doc-3", name: "Dr. Nusrat Jahan", specialization: "Pediatrics" },
];
const patientFormSchema: any = z.object({
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
    doctorId: z.string().min(1, "Please assign a doctor"),
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

const getTodayIsoDate = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const PatientFormModal: React.FC<PatientFormModalProps> = ({
    isOpen,
    initialData = null,
    doctors = DEFAULT_DOCTORS,
    isSubmitting = false,
    onClose,
    onSubmitPatient,
}) => {
    const isEditing = Boolean(initialData?.id);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PatientFormValues>({
        resolver: zodResolver(patientFormSchema),
        defaultValues: {
            name: "",
            age: 30,
            gender: "Male",
            phone: "",
            email: "",
            doctorId: doctors[0]?.id ?? "",
            condition: "Stable",
            admissionDate: getTodayIsoDate(),
            notes: "",
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    name: initialData.name,
                    age: initialData.age,
                    gender: initialData.gender,
                    phone: initialData.phone,
                    email: initialData.email ?? "",
                    doctorId: initialData.doctorId,
                    condition: initialData.condition,
                    admissionDate: initialData.admissionDate,
                    notes: initialData.notes ?? "",
                });
            } else {
                reset({
                    name: "",
                    age: 30,
                    gender: "Male",
                    phone: "",
                    email: "",
                    doctorId: doctors[0]?.id ?? "",
                    condition: "Stable",
                    admissionDate: getTodayIsoDate(),
                    notes: "",
                });
            }
        }
    }, [isOpen, initialData, doctors, reset]);

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

    if (!isOpen) {
        return null;
    }

    const handleFormSubmit = async (values: PatientFormValues) => {
        await onSubmitPatient(
            {
                ...values,
                email: values.email?.trim() ? values.email.trim() : undefined,
            },
            initialData?.id
        );
    };
    //=========================
    // RENDER MAIL ELEMENT
    //=========================
    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="patient_form_modal_title"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isSubmitting) {
                    onClose();
                }
            }}
            className="patientformmodal_backdrop_div fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
            <div className="patientformmodal_dialog_div w-full max-w-xl my-auto overflow-hidden">
                {/* Header */}
                <div className="patientformmodal_header_div flex items-center justify-between gap-3 px-6 py-4 border-b border-slate-100">
                    <div className="patientformmodal_titlegroup_div flex items-center gap-3">
                        <div className="patientformmodal_iconbox_div w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <UserRound className="patientformmodal_titleicon_svg w-5 h-5" />
                        </div>
                        <div className="patientformmodal_titles_div">
                            <h2
                                id="patient_form_modal_title"
                                className="patientformmodal_title_h2 text-lg font-bold tracking-tight text-slate-900"
                            >
                                {isEditing ? "Edit Patient Record" : "Add New Patient"}
                            </h2>
                            <p className="patientformmodal_subtitle_p text-xs text-slate-500">
                                {isEditing
                                    ? "Update patient details, clinical condition, or assigned doctor"
                                    : "Create a new patient record and assign a specialist"}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Close modal"
                        className="patientformmodal_closebtn_button p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
                    >
                        <X className="patientformmodal_closesvg_svg w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form
                    id="patient_form_modal_form"
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="patientformmodal_body_div p-6 space-y-4 max-h-[80vh] overflow-y-auto"
                    noValidate
                >
                    {/* Full Name */}
                    <div className="patientformmodal_fieldgroup_div space-y-1.5">
                        <label
                            htmlFor="patient_record_name"
                            className="patientformmodal_label_label block text-xs sm:text-sm font-semibold text-slate-700"
                        >
                            Patient Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="patient_record_name"
                            type="text"
                            placeholder="e.g., Arifur Rahman"
                            {...register("name")}
                            className={`patientformmodal_field_input w-full px-3.5 py-2 text-sm ${errors.name ? "patientformmodal_field_error_input" : ""
                                }`}
                        />
                        {errors.name && (
                            <p className="patientformmodal_error_p text-xs font-medium text-red-600">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Age & Gender Row */}
                    <div className="patientformmodal_row_div grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="patientformmodal_fieldgroup_div space-y-1.5">
                            <label
                                htmlFor="patient_record_age"
                                className="patientformmodal_label_label block text-xs sm:text-sm font-semibold text-slate-700"
                            >
                                Age (Years) <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="patient_record_age"
                                type="number"
                                min={0}
                                max={130}
                                {...register("age", { valueAsNumber: true })}
                                className={`patientformmodal_field_input w-full px-3.5 py-2 text-sm tabular-nums ${errors.age ? "patientformmodal_field_error_input" : ""
                                    }`}
                            />
                            {errors.age && (
                                <p className="patientformmodal_error_p text-xs font-medium text-red-600">
                                    {errors.age.message}
                                </p>
                            )}
                        </div>

                        <div className="patientformmodal_fieldgroup_div space-y-1.5">
                            <label
                                htmlFor="patient_record_gender"
                                className="patientformmodal_label_label block text-xs sm:text-sm font-semibold text-slate-700"
                            >
                                Gender <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="patient_record_gender"
                                {...register("gender")}
                                className={`patientformmodal_field_select w-full px-3.5 py-2 text-sm ${errors.gender ? "patientformmodal_field_error_select" : ""
                                    }`}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.gender && (
                                <p className="patientformmodal_error_p text-xs font-medium text-red-600">
                                    {errors.gender.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Phone & Email Row */}
                    <div className="patientformmodal_row_div grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="patientformmodal_fieldgroup_div space-y-1.5">
                            <label
                                htmlFor="patient_record_phone"
                                className="patientformmodal_label_label block text-xs sm:text-sm font-semibold text-slate-700"
                            >
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <div className="patientformmodal_inputwrap_div relative">
                                <Phone className="patientformmodal_inputicon_svg w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    id="patient_record_phone"
                                    type="tel"
                                    placeholder="+880 17XX-XXXXXX"
                                    {...register("phone")}
                                    className={`patientformmodal_field_input w-full pl-9 pr-3.5 py-2 text-sm ${errors.phone ? "patientformmodal_field_error_input" : ""
                                        }`}
                                />
                            </div>
                            {errors.phone && (
                                <p className="patientformmodal_error_p text-xs font-medium text-red-600">
                                    {errors.phone.message}
                                </p>
                            )}
                        </div>

                        <div className="patientformmodal_fieldgroup_div space-y-1.5">
                            <label
                                htmlFor="patient_record_email"
                                className="patientformmodal_label_label block text-xs sm:text-sm font-semibold text-slate-700"
                            >
                                Email{" "}
                                <span className="text-slate-400 font-normal">(Optional)</span>
                            </label>
                            <div className="patientformmodal_inputwrap_div relative">
                                <Mail className="patientformmodal_inputicon_svg w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    id="patient_record_email"
                                    type="email"
                                    placeholder="patient@example.com"
                                    {...register("email")}
                                    className={`patientformmodal_field_input w-full pl-9 pr-3.5 py-2 text-sm ${errors.email ? "patientformmodal_field_error_input" : ""
                                        }`}
                                />
                            </div>
                            {errors.email && (
                                <p className="patientformmodal_error_p text-xs font-medium text-red-600">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Assigned Doctor & Condition Row */}
                    <div className="patientformmodal_row_div grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="patientformmodal_fieldgroup_div space-y-1.5">
                            <label
                                htmlFor="patient_record_doctor"
                                className="patientformmodal_label_label block text-xs sm:text-sm font-semibold text-slate-700"
                            >
                                Assigned Doctor <span className="text-red-500">*</span>
                            </label>
                            <div className="patientformmodal_inputwrap_div relative">
                                <Stethoscope className="patientformmodal_inputicon_svg w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                    id="patient_record_doctor"
                                    {...register("doctorId")}
                                    className={`patientformmodal_field_select w-full pl-9 pr-3.5 py-2 text-sm ${errors.doctorId
                                        ? "patientformmodal_field_error_select"
                                        : ""
                                        }`}
                                >
                                    <option value="">Select a doctor...</option>
                                    {doctors.map((doc) => (
                                        <option key={doc.id} value={doc.id}>
                                            {doc.name}
                                            {doc.specialization ? ` • ${doc.specialization}` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {errors.doctorId && (
                                <p className="patientformmodal_error_p text-xs font-medium text-red-600">
                                    {errors.doctorId.message}
                                </p>
                            )}
                        </div>

                        <div className="patientformmodal_fieldgroup_div space-y-1.5">
                            <label
                                htmlFor="patient_record_condition"
                                className="patientformmodal_label_label block text-xs sm:text-sm font-semibold text-slate-700"
                            >
                                Patient Condition <span className="text-red-500">*</span>
                            </label>
                            <div className="patientformmodal_inputwrap_div relative">
                                <HeartPulse className="patientformmodal_inputicon_svg w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <select
                                    id="patient_record_condition"
                                    {...register("condition")}
                                    className={`patientformmodal_field_select w-full pl-9 pr-3.5 py-2 text-sm ${errors.condition
                                        ? "patientformmodal_field_error_select"
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
                                <p className="patientformmodal_error_p text-xs font-medium text-red-600">
                                    {errors.condition.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Admission / Visit Date */}
                    <div className="patientformmodal_fieldgroup_div space-y-1.5">
                        <label
                            htmlFor="patient_record_date"
                            className="patientformmodal_label_label block text-xs sm:text-sm font-semibold text-slate-700"
                        >
                            Admission / Visit Date <span className="text-red-500">*</span>
                        </label>
                        <div className="patientformmodal_inputwrap_div relative">
                            <Calendar className="patientformmodal_inputicon_svg w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                id="patient_record_date"
                                type="date"
                                {...register("admissionDate")}
                                className={`patientformmodal_field_input w-full pl-9 pr-3.5 py-2 text-sm ${errors.admissionDate
                                    ? "patientformmodal_field_error_input"
                                    : ""
                                    }`}
                            />
                        </div>
                        {errors.admissionDate && (
                            <p className="patientformmodal_error_p text-xs font-medium text-red-600">
                                {errors.admissionDate.message}
                            </p>
                        )}
                    </div>

                    {/* Clinical Notes */}
                    <div className="patientformmodal_fieldgroup_div space-y-1.5">
                        <label
                            htmlFor="patient_record_notes"
                            className="patientformmodal_label_label flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700"
                        >
                            <span className="patientformmodal_notelabel_span inline-flex items-center gap-1.5">
                                <FileText className="patientformmodal_noteicon_svg w-3.5 h-3.5 text-slate-400" />
                                Clinical Notes / Diagnosis Summary
                            </span>
                            <span className="patientformmodal_opt_span text-xs font-normal text-slate-400">
                                Optional
                            </span>
                        </label>
                        <textarea
                            id="patient_record_notes"
                            rows={3}
                            placeholder="Symptoms, vitals, medication notes, or follow-up details..."
                            {...register("notes")}
                            className={`patientformmodal_field_textarea w-full px-3.5 py-2 text-sm resize-none ${errors.notes ? "patientformmodal_field_error_textarea" : ""
                                }`}
                        />
                        {errors.notes && (
                            <p className="patientformmodal_error_p text-xs font-medium text-red-600">
                                {errors.notes.message}
                            </p>
                        )}
                    </div>
                </form>

                {/* Footer */}
                <div className="patientformmodal_footer_div flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50/70 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="patientformmodal_cancelbtn_button px-4 py-2 text-xs sm:text-sm font-semibold cursor-pointer disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        form="patient_form_modal_form"
                        disabled={isSubmitting}
                        className="patientformmodal_submitbtn_button inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold cursor-pointer disabled:opacity-60"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="patientformmodal_spin_svg w-4 h-4 animate-spin" />
                                <span className="patientformmodal_submittext_span">
                                    {isEditing ? "Saving..." : "Creating..."}
                                </span>
                            </>
                        ) : isEditing ? (
                            <>
                                <Save className="patientformmodal_submiticon_svg w-4 h-4" />
                                <span className="patientformmodal_submittext_span">
                                    Save Changes
                                </span>
                            </>
                        ) : (
                            <>
                                <UserPlus className="patientformmodal_submiticon_svg w-4 h-4" />
                                <span className="patientformmodal_submittext_span">
                                    Create Patient
                                </span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PatientFormModal;