"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    X,
    Stethoscope,
    User,
    Building2,
    Phone,
    Mail,
    Loader2,
    UserPlus,
    Save,
} from "lucide-react";
import "./doctorformmodal.css";

export interface DoctorFormValues {
    name: string;
    specialization: string;
    hospital: string;
    phone: string;
    email: string;
}

export interface EditableDoctor extends DoctorFormValues {
    id: string;
}

interface DoctorFormModalProps {
    isOpen: boolean;
    initialData?: EditableDoctor | null;
    specializations?: string[];
    isSubmitting?: boolean;
    onClose: () => void;
    onSubmitDoctor: (
        values: DoctorFormValues,
        doctorId?: string
    ) => Promise<void> | void;
}

const DEFAULT_SPECIALIZATIONS = [
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "Orthopedics",
    "Dermatology",
    "Internal Medicine",
    "Gynecology",
    "General Surgery",
];
//=========================
// DOCTOR FORM VALIDATION
//=========================
const doctorSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Doctor name must be at least 2 characters")
        .max(100, "Name is too long"),
    specialization: z
        .string()
        .trim()
        .min(2, "Specialization is required")
        .max(80, "Specialization is too long"),
    hospital: z
        .string()
        .trim()
        .min(2, "Hospital / clinic name is required")
        .max(120, "Hospital name is too long"),
    phone: z
        .string()
        .trim()
        .min(7, "Please enter a valid phone number")
        .max(25, "Phone number is too long"),
    email: z
        .string()
        .trim()
        .email("Please enter a valid email address"),
});

const EMPTY_VALUES: DoctorFormValues = {
    name: "",
    specialization: "",
    hospital: "",
    phone: "",
    email: "",
};
//=========================
// RENDER MAIN ELEMENT
//=========================
const DoctorFormModal: React.FC<DoctorFormModalProps> = ({
    isOpen,
    initialData = null,
    specializations = DEFAULT_SPECIALIZATIONS,
    isSubmitting = false,
    onClose,
    onSubmitDoctor,
}) => {
    const isEditing = Boolean(initialData?.id);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<DoctorFormValues>({
        resolver: zodResolver(doctorSchema),
        defaultValues: EMPTY_VALUES,
    });

    const currentSpecialization = watch("specialization");

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    name: initialData.name,
                    specialization: initialData.specialization,
                    hospital: initialData.hospital,
                    phone: initialData.phone,
                    email: initialData.email,
                });
            } else {
                reset(EMPTY_VALUES);
            }
        }
    }, [isOpen, initialData, reset]);

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

    const handleFormSubmit = async (values: DoctorFormValues) => {
        await onSubmitDoctor(values, initialData?.id);
    };

    const isPresetSpec = specializations.includes(currentSpecialization);

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="doctor_form_modal_title"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isSubmitting) {
                    onClose();
                }
            }}
            className="doctorformmodal_backdrop_div fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
            <div className="doctorformmodal_dialog_div w-full max-w-lg my-auto overflow-hidden">
                {/* Header */}
                <div className="doctorformmodal_header_div flex items-center justify-between gap-3 px-6 py-4 border-b border-slate-100">
                    <div className="doctorformmodal_titlegroup_div flex items-center gap-3">
                        <div className="doctorformmodal_iconbox_div w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Stethoscope className="doctorformmodal_titleicon_svg w-5 h-5" />
                        </div>
                        <div className="doctorformmodal_titles_div">
                            <h2
                                id="doctor_form_modal_title"
                                className="doctorformmodal_title_h2 text-lg font-bold tracking-tight text-slate-900"
                            >
                                {isEditing ? "Edit Doctor Profile" : "Add New Doctor"}
                            </h2>
                            <p className="doctorformmodal_subtitle_p text-xs text-slate-500">
                                {isEditing
                                    ? "Update specialist credentials and hospital assignment"
                                    : "Register a specialist into the Doctor Tracker directory"}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Close modal"
                        className="doctorformmodal_closebtn_button p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
                    >
                        <X className="doctorformmodal_closesvg_svg w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form
                    id="doctor_form_modal_form"
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="doctorformmodal_body_div p-6 space-y-4 max-h-[80vh] overflow-y-auto"
                    noValidate
                >
                    {/* Doctor Name */}
                    <div className="doctorformmodal_fieldgroup_div space-y-1.5">
                        <label
                            htmlFor="doctor_name"
                            className="doctorformmodal_label_label block text-xs sm:text-sm font-semibold text-slate-700"
                        >
                            Doctor Name <span className="text-red-500">*</span>
                        </label>
                        <div className="doctorformmodal_inputwrap_div relative">
                            <User className="doctorformmodal_inputicon_svg w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                id="doctor_name"
                                type="text"
                                placeholder="e.g., Dr. Farhana Rahman"
                                {...register("name")}
                                className={`doctorformmodal_field_input w-full pl-9 pr-3.5 py-2 text-sm ${errors.name ? "doctorformmodal_field_error_input" : ""
                                    }`}
                            />
                        </div>
                        {errors.name && (
                            <p className="doctorformmodal_error_p text-xs font-medium text-red-600">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Specialization (Preset Quick-Select + Custom Text Input) */}
                    <div className="doctorformmodal_fieldgroup_div space-y-1.5">
                        <div className="doctorformmodal_labelrow_div flex items-center justify-between gap-2">
                            <label
                                htmlFor="doctor_specialization"
                                className="doctorformmodal_label_label block text-xs sm:text-sm font-semibold text-slate-700"
                            >
                                Specialization <span className="text-red-500">*</span>
                            </label>

                            <select
                                aria-label="Quick select specialization"
                                value={isPresetSpec ? currentSpecialization : ""}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        setValue("specialization", e.target.value, {
                                            shouldValidate: true,
                                        });
                                    }
                                }}
                                className="doctorformmodal_field_select px-2 py-1 text-xs text-slate-600"
                            >
                                <option value="">Quick pick specialty...</option>
                                {specializations.map((spec) => (
                                    <option key={spec} value={spec}>
                                        {spec}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="doctorformmodal_inputwrap_div relative">
                            <Stethoscope className="doctorformmodal_inputicon_svg w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                id="doctor_specialization"
                                type="text"
                                placeholder="e.g., Cardiology, Neurology, Pediatrics"
                                {...register("specialization")}
                                className={`doctorformmodal_field_input w-full pl-9 pr-3.5 py-2 text-sm ${errors.specialization
                                        ? "doctorformmodal_field_error_input"
                                        : ""
                                    }`}
                            />
                        </div>
                        {errors.specialization && (
                            <p className="doctorformmodal_error_p text-xs font-medium text-red-600">
                                {errors.specialization.message}
                            </p>
                        )}
                    </div>

                    {/* Hospital */}
                    <div className="doctorformmodal_fieldgroup_div space-y-1.5">
                        <label
                            htmlFor="doctor_hospital"
                            className="doctorformmodal_label_label block text-xs sm:text-sm font-semibold text-slate-700"
                        >
                            Hospital / Clinic <span className="text-red-500">*</span>
                        </label>
                        <div className="doctorformmodal_inputwrap_div relative">
                            <Building2 className="doctorformmodal_inputicon_svg w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                id="doctor_hospital"
                                type="text"
                                placeholder="e.g., Dhaka Medical Hub"
                                {...register("hospital")}
                                className={`doctorformmodal_field_input w-full pl-9 pr-3.5 py-2 text-sm ${errors.hospital ? "doctorformmodal_field_error_input" : ""
                                    }`}
                            />
                        </div>
                        {errors.hospital && (
                            <p className="doctorformmodal_error_p text-xs font-medium text-red-600">
                                {errors.hospital.message}
                            </p>
                        )}
                    </div>

                    {/* Phone & Email Row */}
                    <div className="doctorformmodal_row_div grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="doctorformmodal_fieldgroup_div space-y-1.5">
                            <label
                                htmlFor="doctor_phone"
                                className="doctorformmodal_label_label block text-xs sm:text-sm font-semibold text-slate-700"
                            >
                                Phone <span className="text-red-500">*</span>
                            </label>
                            <div className="doctorformmodal_inputwrap_div relative">
                                <Phone className="doctorformmodal_inputicon_svg w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    id="doctor_phone"
                                    type="tel"
                                    placeholder="+880 17XX-XXXXXX"
                                    {...register("phone")}
                                    className={`doctorformmodal_field_input w-full pl-9 pr-3.5 py-2 text-sm ${errors.phone ? "doctorformmodal_field_error_input" : ""
                                        }`}
                                />
                            </div>
                            {errors.phone && (
                                <p className="doctorformmodal_error_p text-xs font-medium text-red-600">
                                    {errors.phone.message}
                                </p>
                            )}
                        </div>

                        <div className="doctorformmodal_fieldgroup_div space-y-1.5">
                            <label
                                htmlFor="doctor_email"
                                className="doctorformmodal_label_label block text-xs sm:text-sm font-semibold text-slate-700"
                            >
                                Email <span className="text-red-500">*</span>
                            </label>
                            <div className="doctorformmodal_inputwrap_div relative">
                                <Mail className="doctorformmodal_inputicon_svg w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    id="doctor_email"
                                    type="email"
                                    placeholder="doctor@hospital.com"
                                    {...register("email")}
                                    className={`doctorformmodal_field_input w-full pl-9 pr-3.5 py-2 text-sm ${errors.email ? "doctorformmodal_field_error_input" : ""
                                        }`}
                                />
                            </div>
                            {errors.email && (
                                <p className="doctorformmodal_error_p text-xs font-medium text-red-600">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="doctorformmodal_footer_div flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50/70 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="doctorformmodal_cancelbtn_button px-4 py-2 text-xs sm:text-sm font-semibold cursor-pointer disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        form="doctor_form_modal_form"
                        disabled={isSubmitting}
                        className="doctorformmodal_submitbtn_button inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold cursor-pointer disabled:opacity-60"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="doctorformmodal_spin_svg w-4 h-4 animate-spin" />
                                <span className="doctorformmodal_submittext_span">
                                    {isEditing ? "Saving..." : "Creating..."}
                                </span>
                            </>
                        ) : isEditing ? (
                            <>
                                <Save className="doctorformmodal_submiticon_svg w-4 h-4" />
                                <span className="doctorformmodal_submittext_span">
                                    Save Changes
                                </span>
                            </>
                        ) : (
                            <>
                                <UserPlus className="doctorformmodal_submiticon_svg w-4 h-4" />
                                <span className="doctorformmodal_submittext_span">
                                    Create Doctor
                                </span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoctorFormModal;