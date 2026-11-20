"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
    Users,
    UserPlus,
    Pencil,
    Trash2,
    Phone,
    Mail,
    Calendar,
    Stethoscope,
    ChevronLeft,
    ChevronRight,
    Inbox,
    FileText,
    Loader2,
    RefreshCw,
} from "lucide-react";
import "./PatientsPage.css";
import { extractApiErrorMessage } from "@/lib/api";
import {
    doctorService,
    patientService,
    type PaginationMeta,
    type PatientRecord,
} from "@/services";
import PatientFilters, {
    EMPTY_PATIENT_FILTERS,
    type DoctorFilterOption,
    type PatientFilterValues,
} from "@/components/patients/PatientFilters";
import PatientFormModal, {
    type EditablePatientRecord,
    type PatientConditionType,
    type PatientFormValues,
} from "@/components/patients/PatientFormModal";

export type PatientDirectoryRecord = PatientRecord;

const CONDITION_BADGE_MAP: Record<PatientConditionType, string> = {
    Stable: "patientspage_cond_stable_span",
    Monitoring: "patientspage_cond_monitoring_span",
    Critical: "patientspage_cond_critical_span",
    Recovering: "patientspage_cond_recovering_span",
};

const PAGE_SIZE = 5;

const PatientsPage = () => {
    const [patients, setPatients] = useState<PatientDirectoryRecord[]>([]);
    const [doctorsCatalog, setDoctorsCatalog] = useState<DoctorFilterOption[]>([]);
    const [filters, setFilters] =
        useState<PatientFilterValues>(EMPTY_PATIENT_FILTERS);
    const [pagination, setPagination] = useState<PaginationMeta>({
        page: 1,
        limit: PAGE_SIZE,
        total: 0,
        totalPages: 1,
    });

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Create / Edit modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] =
        useState<EditablePatientRecord | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch doctors list once for filter & modal doctor selector
    useEffect(() => {
        let active = true;
        doctorService
            .getAll({ page: 1, limit: 50 })
            .then((res) => {
                if (!active) return;
                setDoctorsCatalog(
                    res.data.map((doc) => ({
                        id: doc.id,
                        name: doc.name,
                        specialization: doc.specialization,
                    }))
                );
            })
            .catch(() => {
                // Non-blocking: filter/modal can still function if doctors fail to load
            });
        return () => {
            active = false;
        };
    }, []);
  //============================
  // FETCH ALL PATIENTS
  //============================
    const fetchPatients = useCallback(
        async (targetPage = pagination.page, activeFilters = filters) => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const res = await patientService.getAll({
                    search: activeFilters.search.trim() || undefined,
                    condition: activeFilters.condition || undefined,
                    doctorId: activeFilters.doctorId || undefined,
                    startDate: activeFilters.startDate || undefined,
                    endDate: activeFilters.endDate || undefined,
                    page: targetPage,
                    limit: PAGE_SIZE,
                });

                setPatients(res.data);
                setPagination(res.pagination);
            } catch (err) {
                const msg = extractApiErrorMessage(err, "Failed to load patients.");
                setErrorMessage(msg);
                toast.error(msg);
            } finally {
                setIsLoading(false);
            }
        },
        [filters, pagination.page]
    );

    useEffect(() => {
        fetchPatients(pagination.page, filters);
    }, [fetchPatients, pagination.page, filters]);

    const handleFiltersChange = (nextFilters: PatientFilterValues) => {
        setFilters(nextFilters);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleResetFilters = () => {
        setFilters(EMPTY_PATIENT_FILTERS);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleOpenCreate = () => {
        setEditingPatient(null);
        setIsModalOpen(true);
    };
  //============================
  // EDIT PATIENTS DATA
  //============================
    const handleOpenEdit = (pt: PatientDirectoryRecord) => {
        setEditingPatient({
            id: pt.id,
            name: pt.name,
            age: pt.age,
            gender: pt.gender,
            phone: pt.phone,
            email: pt.email ?? "",
            doctorId: pt.doctorId,
            condition: pt.condition,
            admissionDate: pt.admissionDate,
            notes: pt.notes ?? "",
        });
        setIsModalOpen(true);
    };
  //============================
  // ADD NEW PATIENTS
  //============================
    const handleSubmitPatient = async (
        values: PatientFormValues,
        patientId?: string
    ) => {
        setIsSubmitting(true);
        try {
            const payload = {
                name: values.name.trim(),
                age: Number(values.age),
                gender: values.gender,
                phone: values.phone.trim(),
                email: values.email?.trim() ? values.email.trim() : undefined,
                doctorId: values.doctorId,
                condition: values.condition,
                admissionDate: values.admissionDate,
                notes: values.notes?.trim() ? values.notes.trim() : undefined,
            };

            if (patientId) {
                await patientService.update(patientId, payload);
                toast.success(`Updated ${values.name}'s patient record`);
                await fetchPatients(pagination.page, filters);
            } else {
                await patientService.create(payload);
                toast.success(`Added ${values.name} to patient records`);
                setPagination((prev) => ({ ...prev, page: 1 }));
                await fetchPatients(1, filters);
            }

            setIsModalOpen(false);
            setEditingPatient(null);
        } catch (err) {
            toast.error(extractApiErrorMessage(err, "Failed to save patient record."));
        } finally {
            setIsSubmitting(false);
        }
    };
  //============================
  // DELETE PATIENTS DATA
  //============================
    const handleDeletePatient = async (patientId: string, patientName: string) => {
        try {
            await patientService.remove(patientId);
            toast.success(`Deleted ${patientName} from patient records`);
            const nextPage =
                patients.length === 1 && pagination.page > 1
                    ? pagination.page - 1
                    : pagination.page;
            await fetchPatients(nextPage, filters);
        } catch (err) {
            toast.error(extractApiErrorMessage(err, "Failed to delete patient."));
        }
    };
  //============================
  // RENDER MAIL ELEMENT
  //============================
    return (
        <div className="patientspage_wrapper_div min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Page Header */}
            <header className="patientspage_header_div flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="patientspage_titlegroup_div space-y-1">
                    <div className="patientspage_badge_div inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                        <Users className="patientspage_badgesvg_svg w-3.5 h-3.5" />
                        <span className="patientspage_badgetext_span">
                            Central Patient Registry
                        </span>
                    </div>
                    <h1 className="patientspage_title_h1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                        Patients Management
                    </h1>
                    <p className="patientspage_subtitle_p text-xs sm:text-sm text-slate-500">
                        Search, filter by condition or date, edit patient profiles, and
                        manage records across doctors.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="patientspage_primarybtn_button inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold cursor-pointer self-start sm:self-auto"
                >
                    <UserPlus className="patientspage_addsvg_svg w-4 h-4" />
                    <span className="patientspage_addtext_span">Add Patient</span>
                </button>
            </header>

            {/* Search & Filters */}
            <PatientFilters
                filters={filters}
                doctors={doctorsCatalog}
                totalResults={pagination.total}
                onChange={handleFiltersChange}
                onReset={handleResetFilters}
            />

            {/* Loading / Error / Empty / Table */}
            {isLoading ? (
                <div className="patientspage_card_div p-12 flex flex-col items-center justify-center gap-3 text-slate-500">
                    <Loader2 className="patientspage_spin_svg w-6 h-6 animate-spin text-blue-600" />
                    <p className="patientspage_loading_p text-xs sm:text-sm font-medium">
                        Loading patient records...
                    </p>
                </div>
            ) : errorMessage ? (
                <div className="patientspage_card_div p-8 flex flex-col items-center justify-center text-center gap-3">
                    <p className="patientspage_errortitle_p text-sm font-bold text-red-600">
                        Unable to load patients
                    </p>
                    <p className="patientspage_errordesc_p text-xs text-slate-500 max-w-md">
                        {errorMessage}
                    </p>
                    <button
                        type="button"
                        onClick={() => fetchPatients(pagination.page, filters)}
                        className="patientspage_secondarybtn_button inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold cursor-pointer"
                    >
                        <RefreshCw className="patientspage_retrysvg_svg w-3.5 h-3.5" />
                        <span>Retry</span>
                    </button>
                </div>
            ) : patients.length === 0 ? (
                <div className="patientspage_card_div p-10 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="patientspage_emptyicon_div w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                        <Inbox className="patientspage_emptysvg_svg w-6 h-6" />
                    </div>
                    <h2 className="patientspage_emptytitle_h2 text-base font-bold text-slate-800">
                        No patient records found
                    </h2>
                    <p className="patientspage_emptydesc_p text-xs sm:text-sm text-slate-500 max-w-md">
                        Try adjusting your search query, condition filter, assigned doctor,
                        or date range.
                    </p>
                    <button
                        type="button"
                        onClick={handleResetFilters}
                        className="patientspage_secondarybtn_button px-4 py-2 text-xs font-semibold cursor-pointer"
                    >
                        Reset All Filters
                    </button>
                </div>
            ) : (
                <section
                    aria-label="Patients Directory Table"
                    className="patientspage_card_div overflow-hidden"
                >
                    <div className="patientspage_tablewrap_div overflow-x-auto">
                        <table className="patientspage_table_table w-full text-left border-collapse">
                            <thead>
                                <tr className="patientspage_thead_tr border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                    <th className="patientspage_th_th py-3.5 pl-5 pr-3">
                                        Patient
                                    </th>
                                    <th className="patientspage_th_th py-3.5 px-3">Contact</th>
                                    <th className="patientspage_th_th py-3.5 px-3">
                                        Assigned Doctor
                                    </th>
                                    <th className="patientspage_th_th py-3.5 px-3">Condition</th>
                                    <th className="patientspage_th_th py-3.5 px-3">
                                        Admission Date
                                    </th>
                                    <th className="patientspage_th_th py-3.5 pl-3 pr-5 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="patientspage_tbody_tbody divide-y divide-slate-100 text-xs sm:text-sm">
                                {patients.map((pt) => (
                                    <tr
                                        key={pt.id}
                                        className="patientspage_row_tr hover:bg-slate-50/80 transition-colors align-top sm:align-middle"
                                    >
                                        {/* Patient Name, Age/Gender, Notes */}
                                        <td className="patientspage_td_td py-3.5 pl-5 pr-3">
                                            <div className="patientspage_ptcell_div space-y-0.5">
                                                <p className="patientspage_ptname_p font-bold text-slate-900">
                                                    {pt.name}
                                                </p>
                                                <p className="patientspage_ptmeta_p text-xs text-slate-500 tabular-nums">
                                                    {pt.age} yrs • {pt.gender}
                                                </p>
                                                {pt.notes && (
                                                    <p className="patientspage_ptnotes_p text-xs text-slate-400 flex items-center gap-1 pt-0.5 max-w-xs truncate">
                                                        <FileText className="patientspage_notesvg_svg w-3 h-3 shrink-0" />
                                                        <span className="truncate">{pt.notes}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        {/* Phone & Optional Email */}
                                        <td className="patientspage_td_td py-3.5 px-3 whitespace-nowrap">
                                            <div className="patientspage_contact_div space-y-1 text-xs text-slate-600">
                                                <div className="patientspage_contactrow_div flex items-center gap-1.5">
                                                    <Phone className="patientspage_contactsvg_svg w-3.5 h-3.5 text-slate-400" />
                                                    <span>{pt.phone}</span>
                                                </div>
                                                {pt.email && (
                                                    <div className="patientspage_contactrow_div flex items-center gap-1.5 text-slate-500">
                                                        <Mail className="patientspage_contactsvg_svg w-3.5 h-3.5 text-slate-400" />
                                                        <span>{pt.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Assigned Doctor */}
                                        <td className="patientspage_td_td py-3.5 px-3 whitespace-nowrap">
                                            <div className="patientspage_doccell_div space-y-1">
                                                <span className="patientspage_docbadge_span inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                    <Stethoscope className="patientspage_docsvg_svg w-3.5 h-3.5" />
                                                    <span>{pt.doctorName}</span>
                                                </span>
                                                {pt.specialization && (
                                                    <p className="patientspage_docspec_p text-[11px] text-slate-500 pl-1">
                                                        {pt.specialization}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        {/* Condition Badge */}
                                        <td className="patientspage_td_td py-3.5 px-3 whitespace-nowrap">
                                            <span
                                                className={`patientspage_condbadge_span inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${CONDITION_BADGE_MAP[pt.condition]
                                                    }`}
                                            >
                                                {pt.condition}
                                            </span>
                                        </td>

                                        {/* Admission Date */}
                                        <td className="patientspage_td_td py-3.5 px-3 text-slate-600 whitespace-nowrap tabular-nums">
                                            <span className="patientspage_date_span inline-flex items-center gap-1.5 text-xs">
                                                <Calendar className="patientspage_datesvg_svg w-3.5 h-3.5 text-slate-400" />
                                                <span>{pt.admissionDate}</span>
                                            </span>
                                        </td>

                                        {/* Edit & Delete Actions */}
                                        <td className="patientspage_td_td py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                                            <div className="patientspage_rowactions_div inline-flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEdit(pt)}
                                                    className="patientspage_secondarybtn_button inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
                                                >
                                                    <Pencil className="patientspage_editsvg_svg w-3.5 h-3.5" />
                                                    <span>Edit</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDeletePatient(pt.id, pt.name)}
                                                    className="patientspage_dangerbtn_button inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
                                                >
                                                    <Trash2 className="patientspage_delsvg_svg w-3.5 h-3.5" />
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* Pagination Bar */}
            {!isLoading && pagination.total > 0 && (
                <nav
                    aria-label="Patients pagination"
                    className="patientspage_pagination_nav flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 text-xs sm:text-sm"
                >
                    <span className="patientspage_pageinfo_span text-slate-500 tabular-nums">
                        Page <strong className="text-slate-900">{pagination.page}</strong> of{" "}
                        <strong className="text-slate-900">{pagination.totalPages}</strong> (
                        {pagination.total} total)
                    </span>

                    <div className="patientspage_pagebtns_div flex items-center gap-2">
                        <button
                            type="button"
                            disabled={pagination.page <= 1}
                            onClick={() =>
                                setPagination((prev) => ({
                                    ...prev,
                                    page: Math.max(1, prev.page - 1),
                                }))
                            }
                            className="patientspage_secondarybtn_button inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="patientspage_prevsvg_svg w-4 h-4" />
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
                            className="patientspage_secondarybtn_button inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>Next</span>
                            <ChevronRight className="patientspage_nextsvg_svg w-4 h-4" />
                        </button>
                    </div>
                </nav>
            )}

            {/* Create / Edit Patient Modal */}
            <PatientFormModal
                isOpen={isModalOpen}
                initialData={editingPatient}
                doctors={doctorsCatalog}
                isSubmitting={isSubmitting}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingPatient(null);
                }}
                onSubmitPatient={handleSubmitPatient}
            />
        </div>
    );
};

export default PatientsPage;