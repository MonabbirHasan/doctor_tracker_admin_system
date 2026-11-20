"use client";

import React, { useEffect, useState } from "react";
import {
    Search,
    SlidersHorizontal,
    HeartPulse,
    Stethoscope,
    Calendar,
    RotateCcw,
    X,
} from "lucide-react";
import "./patientfilters.css";

export type PatientConditionFilter =
    | ""
    | "Stable"
    | "Monitoring"
    | "Critical"
    | "Recovering";

export interface PatientFilterValues {
    search: string;
    condition: PatientConditionFilter;
    doctorId: string;
    startDate: string;
    endDate: string;
}

export interface DoctorFilterOption {
    id: string;
    name: string;
    specialization?: string;
}

interface PatientFiltersProps {
    filters: PatientFilterValues;
    doctors?: DoctorFilterOption[];
    totalResults?: number;
    debounceMs?: number;
    onChange: (nextFilters: PatientFilterValues) => void;
    onReset?: () => void;
}

const CONDITION_OPTIONS: Exclude<PatientConditionFilter, "">[] = [
    "Stable",
    "Monitoring",
    "Critical",
    "Recovering",
];

export const EMPTY_PATIENT_FILTERS: PatientFilterValues = {
    search: "",
    condition: "",
    doctorId: "",
    startDate: "",
    endDate: "",
};

const PatientFilters: React.FC<PatientFiltersProps> = ({
    filters,
    doctors = [],
    totalResults,
    debounceMs = 250,
    onChange,
    onReset,
}) => {
    const [searchDraft, setSearchDraft] = useState(filters.search);
    const [showAdvanced, setShowAdvanced] = useState(
        Boolean(
            filters.condition ||
            filters.doctorId ||
            filters.startDate ||
            filters.endDate
        )
    );

    useEffect(() => {
        setSearchDraft(filters.search);
    }, [filters.search]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            if (searchDraft !== filters.search) {
                onChange({ ...filters, search: searchDraft });
            }
        }, debounceMs);

        return () => window.clearTimeout(timer);
    }, [searchDraft, filters, debounceMs, onChange]);

    const activeFilterCount = [
        filters.search.trim(),
        filters.condition,
        filters.doctorId,
        filters.startDate,
        filters.endDate,
    ].filter(Boolean).length;

    const selectedDoctorLabel =
        doctors.find((d) => d.id === filters.doctorId)?.name ?? filters.doctorId;

    const handleFieldChange = (
        key: keyof PatientFilterValues,
        value: string
    ) => {
        onChange({
            ...filters,
            [key]: value,
        });
    };

    const handleClearAll = () => {
        setSearchDraft("");
        if (onReset) {
            onReset();
        } else {
            onChange(EMPTY_PATIENT_FILTERS);
        }
    };

    return (
        <section
            aria-label="Patient Search and Filters"
            className="patientfilters_card_div p-4 sm:p-5 space-y-4"
        >
            {/* Top Row: Search Input + Filters Toggle + Reset */}
            <div className="patientfilters_toprow_div flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="patientfilters_searchwrap_div relative flex-1">
                    <Search className="patientfilters_searchicon_svg w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        value={searchDraft}
                        onChange={(e) => setSearchDraft(e.target.value)}
                        placeholder="Search by patient name, phone, email, assigned doctor, or condition..."
                        aria-label="Search patients"
                        className="patientfilters_input_input w-full pl-10 pr-9 py-2.5 text-sm"
                    />
                    {searchDraft && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchDraft("");
                                handleFieldChange("search", "");
                            }}
                            aria-label="Clear search query"
                            className="patientfilters_clearsearch_button absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                            <X className="patientfilters_clearsearchsvg_svg w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <div className="patientfilters_actions_div flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowAdvanced((prev) => !prev)}
                        className={`patientfilters_resetbtn_button inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold cursor-pointer ${showAdvanced ? "border-blue-500 text-blue-600" : ""
                            }`}
                    >
                        <SlidersHorizontal className="patientfilters_filtericon_svg w-4 h-4" />
                        <span className="patientfilters_filtertext_span">Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="patientfilters_countbadge_span px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-600 text-white tabular-nums">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    {activeFilterCount > 0 && (
                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="patientfilters_resetbtn_button inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold cursor-pointer"
                        >
                            <RotateCcw className="patientfilters_resetsvg_svg w-3.5 h-3.5" />
                            <span className="patientfilters_resettext_span">Reset</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Expandable Filter Grid: Condition, Doctor, Start Date, End Date */}
            {showAdvanced && (
                <div className="patientfilters_grid_div grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 pt-3 border-t border-slate-100">
                    {/* Condition Filter */}
                    <div className="patientfilters_field_div space-y-1.5">
                        <label
                            htmlFor="patient_filter_condition"
                            className="patientfilters_label_label flex items-center gap-1.5 text-xs font-semibold text-slate-600"
                        >
                            <HeartPulse className="patientfilters_labelicon_svg w-3.5 h-3.5 text-slate-400" />
                            <span>Patient Condition</span>
                        </label>
                        <select
                            id="patient_filter_condition"
                            value={filters.condition}
                            onChange={(e) =>
                                handleFieldChange(
                                    "condition",
                                    e.target.value as PatientConditionFilter
                                )
                            }
                            className="patientfilters_select_select w-full px-3 py-2 text-sm"
                        >
                            <option value="">All Conditions</option>
                            {CONDITION_OPTIONS.map((cond) => (
                                <option key={cond} value={cond}>
                                    {cond}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Assigned Doctor Filter */}
                    <div className="patientfilters_field_div space-y-1.5">
                        <label
                            htmlFor="patient_filter_doctor"
                            className="patientfilters_label_label flex items-center gap-1.5 text-xs font-semibold text-slate-600"
                        >
                            <Stethoscope className="patientfilters_labelicon_svg w-3.5 h-3.5 text-slate-400" />
                            <span>Assigned Doctor</span>
                        </label>
                        <select
                            id="patient_filter_doctor"
                            value={filters.doctorId}
                            onChange={(e) => handleFieldChange("doctorId", e.target.value)}
                            className="patientfilters_select_select w-full px-3 py-2 text-sm"
                        >
                            <option value="">All Doctors</option>
                            {doctors.map((doc) => (
                                <option key={doc.id} value={doc.id}>
                                    {doc.name}
                                    {doc.specialization ? ` (${doc.specialization})` : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date From */}
                    <div className="patientfilters_field_div space-y-1.5">
                        <label
                            htmlFor="patient_filter_start_date"
                            className="patientfilters_label_label flex items-center gap-1.5 text-xs font-semibold text-slate-600"
                        >
                            <Calendar className="patientfilters_labelicon_svg w-3.5 h-3.5 text-slate-400" />
                            <span>Date From</span>
                        </label>
                        <input
                            id="patient_filter_start_date"
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFieldChange("startDate", e.target.value)}
                            className="patientfilters_date_input w-full px-3 py-2 text-sm"
                        />
                    </div>

                    {/* Date Until */}
                    <div className="patientfilters_field_div space-y-1.5">
                        <label
                            htmlFor="patient_filter_end_date"
                            className="patientfilters_label_label flex items-center gap-1.5 text-xs font-semibold text-slate-600"
                        >
                            <Calendar className="patientfilters_labelicon_svg w-3.5 h-3.5 text-slate-400" />
                            <span>Date Until</span>
                        </label>
                        <input
                            id="patient_filter_end_date"
                            type="date"
                            value={filters.endDate}
                            min={filters.startDate || undefined}
                            onChange={(e) => handleFieldChange("endDate", e.target.value)}
                            className="patientfilters_date_input w-full px-3 py-2 text-sm"
                        />
                    </div>
                </div>
            )}

            {/* Active Chips & Result Count */}
            {(activeFilterCount > 0 || typeof totalResults === "number") && (
                <div className="patientfilters_footer_div flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <div className="patientfilters_chips_div flex flex-wrap items-center gap-1.5">
                        {filters.condition && (
                            <span className="patientfilters_chip_span inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium">
                                <span>Condition: {filters.condition}</span>
                                <button
                                    type="button"
                                    onClick={() => handleFieldChange("condition", "")}
                                    aria-label="Remove condition filter"
                                    className="cursor-pointer"
                                >
                                    <X className="patientfilters_chipsvg_svg w-3 h-3" />
                                </button>
                            </span>
                        )}

                        {filters.doctorId && (
                            <span className="patientfilters_chip_span inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium">
                                <span>Doctor: {selectedDoctorLabel}</span>
                                <button
                                    type="button"
                                    onClick={() => handleFieldChange("doctorId", "")}
                                    aria-label="Remove doctor filter"
                                    className="cursor-pointer"
                                >
                                    <X className="patientfilters_chipsvg_svg w-3 h-3" />
                                </button>
                            </span>
                        )}

                        {(filters.startDate || filters.endDate) && (
                            <span className="patientfilters_chip_span inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium">
                                <span>
                                    Date: {filters.startDate || "Start"} → {filters.endDate || "Now"}
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        onChange({ ...filters, startDate: "", endDate: "" })
                                    }
                                    aria-label="Remove date filter"
                                    className="cursor-pointer"
                                >
                                    <X className="patientfilters_chipsvg_svg w-3 h-3" />
                                </button>
                            </span>
                        )}
                    </div>

                    {typeof totalResults === "number" && (
                        <span className="patientfilters_resultcount_span text-slate-500 font-medium tabular-nums">
                            Showing{" "}
                            <strong className="text-slate-800">
                                {totalResults.toLocaleString()}
                            </strong>{" "}
                            {totalResults === 1 ? "patient" : "patients"}
                        </span>
                    )}
                </div>
            )}
        </section>
    );
};

export default PatientFilters;