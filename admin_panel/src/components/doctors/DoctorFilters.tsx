"use client";

import React, { useEffect, useState } from "react";
import {
    Search,
    SlidersHorizontal,
    Calendar,
    Stethoscope,
    Building2,
    RotateCcw,
    X,
} from "lucide-react";
import "./doctorfilters.css";

export interface DoctorFilterValues {
    search: string;
    specialization: string;
    hospital: string;
    startDate: string;
    endDate: string;
}

interface DoctorFiltersProps {
    filters: DoctorFilterValues;
    specializations?: string[];
    hospitals?: string[];
    totalResults?: number;
    debounceMs?: number;
    onChange: (nextFilters: DoctorFilterValues) => void;
    onReset?: () => void;
}

const DEFAULT_SPECIALIZATIONS = [
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "Orthopedics",
    "Dermatology",
    "Internal Medicine",
    "Gynecology",
];

const DEFAULT_HOSPITALS = [
    "Dhaka Medical Hub",
    "Apex General Hospital",
    "City Care Clinic",
    "National Ortho Center",
    "Muktagacha Health Care",
];

export const EMPTY_DOCTOR_FILTERS: DoctorFilterValues = {
    search: "",
    specialization: "",
    hospital: "",
    startDate: "",
    endDate: "",
};
//=========================
// RENDER MAIN  ELEMENT
//=========================
const DoctorFilters: React.FC<DoctorFiltersProps> = ({
    filters,
    specializations = DEFAULT_SPECIALIZATIONS,
    hospitals = DEFAULT_HOSPITALS,
    totalResults,
    debounceMs = 250,
    onChange,
    onReset,
}) => {
    const [searchDraft, setSearchDraft] = useState(filters.search);
    const [showAdvanced, setShowAdvanced] = useState(
        Boolean(
            filters.specialization ||
            filters.hospital ||
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
        filters.specialization,
        filters.hospital,
        filters.startDate,
        filters.endDate,
    ].filter(Boolean).length;

    const handleFieldChange = (
        key: keyof DoctorFilterValues,
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
            onChange(EMPTY_DOCTOR_FILTERS);
        }
    };

    return (
        <section
            aria-label="Doctor Search and Filters"
            className="doctorfilters_card_div p-4 sm:p-5 space-y-4"
        >
            {/* Top Row: Search Input + Toggle Filters + Reset */}
            <div className="doctorfilters_toprow_div flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="doctorfilters_searchwrap_div relative flex-1">
                    <Search className="doctorfilters_searchicon_svg w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        value={searchDraft}
                        onChange={(e) => setSearchDraft(e.target.value)}
                        placeholder="Search by doctor name, specialization, hospital, phone, or email..."
                        aria-label="Search doctors"
                        className="doctorfilters_input_input w-full pl-10 pr-9 py-2.5 text-sm"
                    />
                    {searchDraft && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchDraft("");
                                handleFieldChange("search", "");
                            }}
                            aria-label="Clear search query"
                            className="doctorfilters_clearsearch_button absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                            <X className="doctorfilters_clearsearchsvg_svg w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Filter Controls */}
                <div className="doctorfilters_actions_div flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowAdvanced((prev) => !prev)}
                        className={`doctorfilters_resetbtn_button inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold cursor-pointer ${showAdvanced ? "border-blue-500 text-blue-600" : ""
                            }`}
                    >
                        <SlidersHorizontal className="doctorfilters_filtericon_svg w-4 h-4" />
                        <span className="doctorfilters_filtertext_span">Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="doctorfilters_countbadge_span px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-600 text-white tabular-nums">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    {activeFilterCount > 0 && (
                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="doctorfilters_resetbtn_button inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold cursor-pointer"
                        >
                            <RotateCcw className="doctorfilters_resetsvg_svg w-3.5 h-3.5" />
                            <span className="doctorfilters_resettext_span">Reset</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Expandable Filter Grid: Specialization, Hospital, Date Range */}
            {showAdvanced && (
                <div className="doctorfilters_grid_div grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 pt-3 border-t border-slate-100">
                    {/* Specialization Filter */}
                    <div className="doctorfilters_field_div space-y-1.5">
                        <label
                            htmlFor="doctor_filter_spec"
                            className="doctorfilters_label_label flex items-center gap-1.5 text-xs font-semibold text-slate-600"
                        >
                            <Stethoscope className="doctorfilters_labelicon_svg w-3.5 h-3.5 text-slate-400" />
                            <span>Specialization</span>
                        </label>
                        <select
                            id="doctor_filter_spec"
                            value={filters.specialization}
                            onChange={(e) => handleFieldChange("specialization", e.target.value)}
                            className="doctorfilters_select_select w-full px-3 py-2 text-sm"
                        >
                            <option value="">All Specializations</option>
                            {specializations.map((spec) => (
                                <option key={spec} value={spec}>
                                    {spec}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Hospital Filter */}
                    <div className="doctorfilters_field_div space-y-1.5">
                        <label
                            htmlFor="doctor_filter_hospital"
                            className="doctorfilters_label_label flex items-center gap-1.5 text-xs font-semibold text-slate-600"
                        >
                            <Building2 className="doctorfilters_labelicon_svg w-3.5 h-3.5 text-slate-400" />
                            <span>Hospital / Clinic</span>
                        </label>
                        <select
                            id="doctor_filter_hospital"
                            value={filters.hospital}
                            onChange={(e) => handleFieldChange("hospital", e.target.value)}
                            className="doctorfilters_select_select w-full px-3 py-2 text-sm"
                        >
                            <option value="">All Hospitals</option>
                            {hospitals.map((hosp) => (
                                <option key={hosp} value={hosp}>
                                    {hosp}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Start Date Filter */}
                    <div className="doctorfilters_field_div space-y-1.5">
                        <label
                            htmlFor="doctor_filter_start_date"
                            className="doctorfilters_label_label flex items-center gap-1.5 text-xs font-semibold text-slate-600"
                        >
                            <Calendar className="doctorfilters_labelicon_svg w-3.5 h-3.5 text-slate-400" />
                            <span>Joined From</span>
                        </label>
                        <input
                            id="doctor_filter_start_date"
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFieldChange("startDate", e.target.value)}
                            className="doctorfilters_date_input w-full px-3 py-2 text-sm"
                        />
                    </div>

                    {/* End Date Filter */}
                    <div className="doctorfilters_field_div space-y-1.5">
                        <label
                            htmlFor="doctor_filter_end_date"
                            className="doctorfilters_label_label flex items-center gap-1.5 text-xs font-semibold text-slate-600"
                        >
                            <Calendar className="doctorfilters_labelicon_svg w-3.5 h-3.5 text-slate-400" />
                            <span>Joined Until</span>
                        </label>
                        <input
                            id="doctor_filter_end_date"
                            type="date"
                            value={filters.endDate}
                            min={filters.startDate || undefined}
                            onChange={(e) => handleFieldChange("endDate", e.target.value)}
                            className="doctorfilters_date_input w-full px-3 py-2 text-sm"
                        />
                    </div>
                </div>
            )}

            {/* Active Chips & Result Count */}
            {(activeFilterCount > 0 || typeof totalResults === "number") && (
                <div className="doctorfilters_footer_div flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <div className="doctorfilters_chips_div flex flex-wrap items-center gap-1.5">
                        {filters.specialization && (
                            <span className="doctorfilters_chip_span inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium">
                                <span>Specialty: {filters.specialization}</span>
                                <button
                                    type="button"
                                    onClick={() => handleFieldChange("specialization", "")}
                                    aria-label="Remove specialization filter"
                                    className="cursor-pointer"
                                >
                                    <X className="doctorfilters_chipsvg_svg w-3 h-3" />
                                </button>
                            </span>
                        )}

                        {filters.hospital && (
                            <span className="doctorfilters_chip_span inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium">
                                <span>Hospital: {filters.hospital}</span>
                                <button
                                    type="button"
                                    onClick={() => handleFieldChange("hospital", "")}
                                    aria-label="Remove hospital filter"
                                    className="cursor-pointer"
                                >
                                    <X className="doctorfilters_chipsvg_svg w-3 h-3" />
                                </button>
                            </span>
                        )}

                        {(filters.startDate || filters.endDate) && (
                            <span className="doctorfilters_chip_span inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium">
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
                                    <X className="doctorfilters_chipsvg_svg w-3 h-3" />
                                </button>
                            </span>
                        )}
                    </div>

                    {typeof totalResults === "number" && (
                        <span className="doctorfilters_resultcount_span text-slate-500 font-medium tabular-nums">
                            Showing{" "}
                            <strong className="text-slate-800">
                                {totalResults.toLocaleString()}
                            </strong>{" "}
                            {totalResults === 1 ? "doctor" : "doctors"}
                        </span>
                    )}
                </div>
            )}
        </section>
    );
};

export default DoctorFilters;