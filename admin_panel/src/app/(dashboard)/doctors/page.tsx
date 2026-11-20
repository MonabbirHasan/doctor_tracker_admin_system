"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
    Stethoscope,
    UserPlus,
    Pencil,
    Trash2,
    Building2,
    Phone,
    Mail,
    Calendar,
    UserCheck,
    X,
    ChevronLeft,
    ChevronRight,
    Inbox,
    Loader2,
    RefreshCw,
} from "lucide-react";
import "./DoctorsPage.css";
import { extractApiErrorMessage } from "@/lib/api";
import {
    doctorService,
    type AssignPatientPayload,
    type DoctorMutationPayload,
    type DoctorRecord,
    type PaginationMeta,
    type PatientCondition,
} from "@/services";
import DoctorFilters, {
    EMPTY_DOCTOR_FILTERS,
    type DoctorFilterValues,
} from "@/components/doctors/DoctorFilters";
import DoctorFormModal, {
    type EditableDoctorRecord,
} from "@/components/doctors/DoctorFormModal";
import AssignPatientModal from "@/components/doctors/AssignPatientModal";

const CONDITION_BADGE_MAP: Record<PatientCondition, string> = {
    Stable: "doctorspage_cond_stable_span",
    Monitoring: "doctorspage_cond_monitoring_span",
    Critical: "doctorspage_cond_critical_span",
    Recovering: "doctorspage_cond_recovering_span",
};

const PAGE_SIZE = 6;

const DoctorsPage = () => {
    const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
    const [filters, setFilters] =
        useState<DoctorFilterValues>(EMPTY_DOCTOR_FILTERS);
    const [pagination, setPagination] = useState<PaginationMeta>({
        page: 1,
        limit: PAGE_SIZE,
        total: 0,
        totalPages: 1,
    });

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Doctor create / edit modal state
    const [isDoctorModalOpen, setIsDoctorModalOpen] = useState<boolean>(false);
    const [editingDoctor, setEditingDoctor] =
        useState<EditableDoctorRecord | null>(null);
    const [isSavingDoctor, setIsSavingDoctor] = useState<boolean>(false);

    // Assign patient modal state
    const [assignTargetDoctor, setAssignTargetDoctor] =
        useState<DoctorRecord | null>(null);
    const [isAssigningPatient, setIsAssigningPatient] = useState<boolean>(false);
  //============================
  // FETCH ALL DOCTORS
  //============================
    const fetchDoctors = useCallback(
        async (targetPage = pagination.page, activeFilters = filters) => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const res = await doctorService.getAll({
                    search: activeFilters.search.trim() || undefined,
                    specialization: activeFilters.specialization.trim() || undefined,
                    hospital: activeFilters.hospital.trim() || undefined,
                    startDate: activeFilters.startDate || undefined,
                    endDate: activeFilters.endDate || undefined,
                    page: targetPage,
                    limit: PAGE_SIZE,
                });

                setDoctors(res.data);
                setPagination(res.pagination);
            } catch (err) {
                const msg = extractApiErrorMessage(err, "Failed to load doctors.");
                setErrorMessage(msg);
                toast.error(msg);
            } finally {
                setIsLoading(false);
            }
        },
        [filters, pagination.page]
    );

    useEffect(() => {
        fetchDoctors(pagination.page, filters);
    }, [fetchDoctors, pagination.page, filters]);

    const handleFiltersChange = (nextFilters: DoctorFilterValues) => {
        setFilters(nextFilters);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleResetFilters = () => {
        setFilters(EMPTY_DOCTOR_FILTERS);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleOpenCreateDoctor = () => {
        setEditingDoctor(null);
        setIsDoctorModalOpen(true);
    };

    const handleOpenEditDoctor = (doc: DoctorRecord) => {
        setEditingDoctor({
            id: doc.id,
            name: doc.name,
            specialization: doc.specialization,
            hospital: doc.hospital,
            phone: doc.phone,
            email: doc.email,
        });
        setIsDoctorModalOpen(true);
    };
  //============================
  // SAVE NEW DOCTOR
  //============================
    const handleSaveDoctor = async (
        values: DoctorMutationPayload,
        doctorId?: string
    ) => {
        setIsSavingDoctor(true);
        try {
            if (doctorId) {
                await doctorService.update(doctorId, values);
                toast.success(`Updated ${values.name}'s profile`);
            } else {
                await doctorService.create(values);
                toast.success(`Added ${values.name} to directory`);
            }
            setIsDoctorModalOpen(false);
            setEditingDoctor(null);
            await fetchDoctors(doctorId ? pagination.page : 1, filters);
        } catch (err) {
            toast.error(extractApiErrorMessage(err, "Could not save doctor."));
        } finally {
            setIsSavingDoctor(false);
        }
    };
  //============================
  // DELETE SINGLE DOCTOR
  //============================
    const handleDeleteDoctor = async (doc: DoctorRecord) => {
        try {
            await doctorService.remove(doc.id);
            toast.success(`Removed ${doc.name}`);
            const nextPage =
                doctors.length === 1 && pagination.page > 1
                    ? pagination.page - 1
                    : pagination.page;
            await fetchDoctors(nextPage, filters);
        } catch (err) {
            toast.error(extractApiErrorMessage(err, "Failed to delete doctor."));
        }
    };
  //============================
  // ASSIGN PATIENT INTO DOCTOR
  //============================
     const handleAssignPatientSubmit = async (
    payload: AssignPatientFormValues & { doctorId: string }
) => {
    const cleanDoctorId =
        typeof payload.doctorId === "string" ? payload.doctorId.trim() : "";

    if (!cleanDoctorId || cleanDoctorId === "[object Object]") {
        toast.error("Invalid doctor ID. Please close and reopen the modal.");
        return;
    }

    setIsAssigningPatient(true);
    try {
        const { doctorId, ...patientData } = payload;
        const createdPatient = await doctorService.assignPatient(
            cleanDoctorId,
            patientData
        );
        setDoctors((prev) =>
            prev.map((doc) =>
                (doc.id || (doc as { _id?: string })._id) === cleanDoctorId
                    ? { ...doc, patients: [createdPatient, ...doc.patients] }
                    : doc
            )
        );
        toast.success(`Assigned ${createdPatient.name} to doctor`);
        setAssignTargetDoctor(null);
    } catch (err) {
        toast.error(extractApiErrorMessage(err, "Failed to assign patient."));
    } finally {
        setIsAssigningPatient(false);
    }
};
  //============================
  // REMOVE ASSIGNED PATIENT
  //============================
    const handleRemoveAssignedPatient = async (
        doctorId: string,
        patientId: string,
        patientName: string
    ) => {
        try {
            await doctorService.removePatient(doctorId, patientId);
            setDoctors((prev) =>
                prev.map((doc) =>
                    doc.id === doctorId
                        ? {
                            ...doc,
                            patients: doc.patients.filter((pt) => pt.id !== patientId),
                        }
                        : doc
                )
            );
            toast.success(`Removed ${patientName} from doctor`);
        } catch (err) {
            toast.error(
                extractApiErrorMessage(err, "Failed to remove assigned patient.")
            );
        }
    };
  //============================
  // RENDER MAIL EMENT
  //============================
    return (
        <div className="doctorspage_wrapper_div min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <header className="doctorspage_header_div flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="doctorspage_titlegroup_div space-y-1">
                    <div className="doctorspage_badge_div inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                        <Stethoscope className="doctorspage_badgesvg_svg w-3.5 h-3.5" />
                        <span className="doctorspage_badgetext_span">
                            Medical Staff & Caseload
                        </span>
                    </div>
                    <h1 className="doctorspage_title_h1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                        Doctors Directory
                    </h1>
                    <p className="doctorspage_subtitle_p text-xs sm:text-sm text-slate-500">
                        Manage doctors, filter by specialty or joined date, and assign or
                        review patients under each doctor.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleOpenCreateDoctor}
                    className="doctorspage_primarybtn_button inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold cursor-pointer self-start sm:self-auto"
                >
                    <UserPlus className="doctorspage_addsvg_svg w-4 h-4" />
                    <span className="doctorspage_addtext_span">Add Doctor</span>
                </button>
            </header>

            {/* Filters */}
            <DoctorFilters
                filters={filters}
                totalResults={pagination.total}
                onChange={handleFiltersChange}
                onReset={handleResetFilters}
            />

            {/* Loading / Error / Empty / Cards */}
            {isLoading ? (
                <div className="doctorspage_card_div p-12 flex flex-col items-center justify-center gap-3 text-slate-500">
                    <Loader2 className="doctorspage_spin_svg w-6 h-6 animate-spin text-blue-600" />
                    <p className="doctorspage_loading_p text-xs sm:text-sm font-medium">
                        Loading doctors and assigned patients...
                    </p>
                </div>
            ) : errorMessage ? (
                <div className="doctorspage_card_div p-8 flex flex-col items-center justify-center text-center gap-3">
                    <p className="doctorspage_errortitle_p text-sm font-bold text-red-600">
                        Unable to load doctors
                    </p>
                    <p className="doctorspage_errordesc_p text-xs text-slate-500 max-w-md">
                        {errorMessage}
                    </p>
                    <button
                        type="button"
                        onClick={() => fetchDoctors(pagination.page, filters)}
                        className="doctorspage_secondarybtn_button inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold cursor-pointer"
                    >
                        <RefreshCw className="doctorspage_retrysvg_svg w-3.5 h-3.5" />
                        <span>Retry</span>
                    </button>
                </div>
            ) : doctors.length === 0 ? (
                <div className="doctorspage_card_div p-10 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="doctorspage_emptyicon_div w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                        <Inbox className="doctorspage_emptysvg_svg w-6 h-6" />
                    </div>
                    <h2 className="doctorspage_emptytitle_h2 text-base font-bold text-slate-800">
                        No doctors match your filters
                    </h2>
                    <p className="doctorspage_emptydesc_p text-xs sm:text-sm text-slate-500 max-w-md">
                        Try clearing your search term, specialization filter, or date range.
                    </p>
                    <button
                        type="button"
                        onClick={handleResetFilters}
                        className="doctorspage_secondarybtn_button px-4 py-2 text-xs font-semibold cursor-pointer"
                    >
                        Reset Filters
                    </button>
                </div>
            ) : (
                <section
                    aria-label="Doctors List"
                    className="doctorspage_grid_section grid grid-cols-1 xl:grid-cols-2 gap-5"
                >
                    {doctors.map((doc) => (
                        <article
                            key={doc.id}
                            className="doctorspage_card_div p-5 flex flex-col justify-between gap-5"
                        >
                            <div className="doctorspage_cardtop_div space-y-4">
                                {/* Doctor Header & Actions */}
                                <div className="doctorspage_docheader_div flex items-start justify-between gap-3">
                                    <div className="doctorspage_docmeta_div space-y-1 min-w-0">
                                        <span className="doctorspage_specbadge_span inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                            {doc.specialization}
                                        </span>
                                        <h2 className="doctorspage_docname_h2 text-lg font-bold text-slate-900 truncate">
                                            {doc.name}
                                        </h2>
                                    </div>

                                    <div className="doctorspage_docactions_div flex items-center gap-1.5 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEditDoctor(doc)}
                                            className="doctorspage_secondarybtn_button inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
                                        >
                                            <Pencil className="doctorspage_editsvg_svg w-3.5 h-3.5" />
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteDoctor(doc)}
                                            className="doctorspage_dangerbtn_button inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
                                        >
                                            <Trash2 className="doctorspage_delsvg_svg w-3.5 h-3.5" />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Contact & Hospital Details */}
                                <div className="doctorspage_details_div grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                                    <div className="doctorspage_detailitem_div flex items-center gap-2 truncate">
                                        <Building2 className="doctorspage_detailsvg_svg w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="truncate">{doc.hospital}</span>
                                    </div>
                                    <div className="doctorspage_detailitem_div flex items-center gap-2 truncate">
                                        <Phone className="doctorspage_detailsvg_svg w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="truncate">{doc.phone}</span>
                                    </div>
                                    <div className="doctorspage_detailitem_div flex items-center gap-2 truncate">
                                        <Mail className="doctorspage_detailsvg_svg w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="truncate">{doc.email}</span>
                                    </div>
                                    <div className="doctorspage_detailitem_div flex items-center gap-2 tabular-nums">
                                        <Calendar className="doctorspage_detailsvg_svg w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span>Joined {doc.joinedDate || "—"}</span>
                                    </div>
                                </div>

                                {/* Nested Assigned Patients */}
                                <div className="doctorspage_patientsbox_div pt-3 border-t border-slate-100 space-y-2.5">
                                    <div className="doctorspage_patientshead_div flex items-center justify-between gap-2">
                                        <span className="doctorspage_patientslabel_span inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                            <UserCheck className="doctorspage_pticon_svg w-3.5 h-3.5 text-blue-600" />
                                            <span>Assigned Patients ({doc.patients.length})</span>
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                console.log(doc);
                                                setAssignTargetDoctor(doc);
                                            }}
                                            className="doctorspage_secondarybtn_button inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold cursor-pointer"
                                        >
                                            <UserPlus className="doctorspage_assignsvg_svg w-3.5 h-3.5" />
                                            <span>Assign Patient</span>
                                        </button>
                                    </div>

                                    {doc.patients.length === 0 ? (
                                        <p className="doctorspage_nopts_p text-xs text-slate-400 py-2">
                                            No patients assigned yet.
                                        </p>
                                    ) : (
                                        <ul className="doctorspage_ptlist_ul divide-y divide-slate-100 rounded-lg border border-slate-100 bg-slate-50/50 px-3">
                                            {doc.patients.map((pt) => (
                                                <li
                                                    key={pt.id}
                                                    className="doctorspage_ptitem_li py-2 flex items-center justify-between gap-2 text-xs"
                                                >
                                                    <div className="doctorspage_ptinfo_div min-w-0">
                                                        <span className="doctorspage_ptname_span font-semibold text-slate-800 mr-2">
                                                            {pt.name}
                                                        </span>
                                                        <span className="doctorspage_ptmeta_span text-slate-500 tabular-nums">
                                                            {pt.age}y • {pt.gender} • {pt.phone}
                                                        </span>
                                                    </div>

                                                    <div className="doctorspage_ptright_div flex items-center gap-2 shrink-0">
                                                        <span
                                                            className={`doctorspage_condbadge_span px-2 py-0.5 rounded-full text-[11px] font-semibold ${CONDITION_BADGE_MAP[pt.condition]
                                                                }`}
                                                        >
                                                            {pt.condition}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            aria-label={`Remove ${pt.name}`}
                                                            onClick={() =>
                                                                handleRemoveAssignedPatient(
                                                                    doc.id,
                                                                    pt.id,
                                                                    pt.name
                                                                )
                                                            }
                                                            className="doctorspage_unassignbtn_button p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                                        >
                                                            <X className="doctorspage_unassignsvg_svg w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </section>
            )}

            {/* Pagination */}
            {!isLoading && pagination.total > 0 && (
                <nav
                    aria-label="Doctors pagination"
                    className="doctorspage_pagination_nav flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 text-xs sm:text-sm"
                >
                    <span className="doctorspage_pageinfo_span text-slate-500 tabular-nums">
                        Page{" "}
                        <strong className="text-slate-900">{pagination.page}</strong> of{" "}
                        <strong className="text-slate-900">{pagination.totalPages}</strong> (
                        {pagination.total} total)
                    </span>

                    <div className="doctorspage_pagebtns_div flex items-center gap-2">
                        <button
                            type="button"
                            disabled={pagination.page <= 1}
                            onClick={() =>
                                setPagination((prev) => ({
                                    ...prev,
                                    page: Math.max(1, prev.page - 1),
                                }))
                            }
                            className="doctorspage_secondarybtn_button inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="doctorspage_prevsvg_svg w-4 h-4" />
                            <span>Previous</span>
                        </button>

                        <button
                            type="button"
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() =>
                                setPagination((prev) => ({
                                    ...prev,
                                    page: Math.min(prev.totalPages, prev.page + 1),
                                }))
                            }
                            className="doctorspage_secondarybtn_button inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>Next</span>
                            <ChevronRight className="doctorspage_nextsvg_svg w-4 h-4" />
                        </button>
                    </div>
                </nav>
            )}

            {/* Create / Edit Doctor Modal */}
            <DoctorFormModal
                isOpen={isDoctorModalOpen}
                initialData={editingDoctor}
                isSubmitting={isSavingDoctor}
                onClose={() => {
                    setIsDoctorModalOpen(false);
                    setEditingDoctor(null);
                }}
                onSubmitDoctor={handleSaveDoctor}
            />

            {/* Assign Patient Modal */}
            <AssignPatientModal
                isOpen={Boolean(assignTargetDoctor)}
                doctor={assignTargetDoctor}
                isSubmitting={isAssigningPatient}
                onClose={() => setAssignTargetDoctor(null)}
                onAssignPatient={handleAssignPatientSubmit}
            />
        </div>
    );
};

export default DoctorsPage;