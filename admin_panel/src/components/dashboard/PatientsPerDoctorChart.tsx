"use client";

import React, { useMemo, useState } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from "recharts";
import {
    Stethoscope,
    ArrowUpDown,
    Users,
    Building2,
    MousePointerClick,
} from "lucide-react";
import "./patientsperdoctorchart.css";

export interface DoctorWorkloadItem {
    id: string;
    name: string;
    specialization: string;
    hospital?: string;
    patientCount: number;
}

type LimitOption = 5 | 8 | "all";
type SortMode = "desc" | "asc" | "name";

interface PatientsPerDoctorChartProps {
    data?: DoctorWorkloadItem[];
    title?: string;
    subtitle?: string;
    isLoading?: boolean;
    onSelectDoctor?: (doctor: DoctorWorkloadItem) => void;
}

interface CustomDoctorTooltipProps {
    active?: boolean;
    payload?: Array<{
        payload?: DoctorWorkloadItem & { sharePercent?: number };
    }>;
}

const DEFAULT_DOCTOR_WORKLOAD: DoctorWorkloadItem[] = [
    {
        id: "doc-1",
        name: "Dr. Farhana Rahman",
        specialization: "Cardiology",
        hospital: "Dhaka Medical Hub",
        patientCount: 48,
    },
    {
        id: "doc-2",
        name: "Dr. Tariqul Islam",
        specialization: "Neurology",
        hospital: "Apex General Hospital",
        patientCount: 39,
    },
    {
        id: "doc-3",
        name: "Dr. Nusrat Jahan",
        specialization: "Pediatrics",
        hospital: "City Care Clinic",
        patientCount: 34,
    },
    {
        id: "doc-4",
        name: "Dr. Mahfuzur Rahman",
        specialization: "Orthopedics",
        hospital: "National Ortho Center",
        patientCount: 27,
    },
    {
        id: "doc-5",
        name: "Dr. Sabina Yasmin",
        specialization: "Dermatology",
        hospital: "Skin & Wellness Center",
        patientCount: 22,
    },
    {
        id: "doc-6",
        name: "Dr. Kamrul Hasan",
        specialization: "Internal Medicine",
        hospital: "Muktagacha Health Care",
        patientCount: 18,
    },
    {
        id: "doc-7",
        name: "Dr. Maliha Chowdhury",
        specialization: "Gynecology",
        hospital: "Mother & Child Care",
        patientCount: 15,
    },
];

const BAR_PALETTE = [
    "#2563eb",
    "#3b82f6",
    "#0284c7",
    "#0ea5e9",
    "#16a34a",
    "#22c55e",
    "#6366f1",
    "#8b5cf6",
];

const CustomDoctorTooltip: React.FC<CustomDoctorTooltipProps> = ({
    active,
    payload,
}) => {
    if (!active || !payload || payload.length === 0 || !payload[0]?.payload) {
        return null;
    }

    const doc = payload[0].payload;

    return (
        <div className="patientsperdoctorchart_tooltip_div p-3 text-xs space-y-2">
            <div className="patientsperdoctorchart_tooltiphead_div border-b border-slate-100 pb-1.5">
                <p className="patientsperdoctorchart_tooltipname_p font-bold text-slate-900 text-sm">
                    {doc.name}
                </p>
                <p className="patientsperdoctorchart_tooltipspec_p text-blue-600 font-medium">
                    {doc.specialization}
                </p>
            </div>

            {doc.hospital && (
                <div className="patientsperdoctorchart_tooltiphosp_div flex items-center gap-1.5 text-slate-500">
                    <Building2 className="patientsperdoctorchart_tooltiphospicon_svg w-3.5 h-3.5 shrink-0" />
                    <span className="patientsperdoctorchart_tooltiphosptext_span truncate">
                        {doc.hospital}
                    </span>
                </div>
            )}

            <div className="patientsperdoctorchart_tooltipmetric_div flex items-center justify-between pt-1">
                <span className="patientsperdoctorchart_tooltipmetrickey_span inline-flex items-center gap-1.5 text-slate-600">
                    <Users className="patientsperdoctorchart_tooltipmetricicon_svg w-3.5 h-3.5 text-blue-600" />
                    Assigned Patients
                </span>
                <span className="patientsperdoctorchart_tooltipmetricval_span font-bold text-slate-900 tabular-nums">
                    {doc.patientCount.toLocaleString()}
                    {typeof doc.sharePercent === "number" ? ` (${doc.sharePercent}%)` : ""}
                </span>
            </div>
        </div>
    );
};

const PatientsPerDoctorChart: React.FC<PatientsPerDoctorChartProps> = ({
    data,
    title = "Patients per Doctor",
    subtitle = "Caseload distribution across active specialists",
    isLoading = false,
    onSelectDoctor,
}) => {
    const [limit, setLimit] = useState<LimitOption>(5);
    const [sortMode, setSortMode] = useState<SortMode>("desc");

    const sourceData = useMemo<DoctorWorkloadItem[]>(() => {
        return data && data.length > 0 ? data : DEFAULT_DOCTOR_WORKLOAD;
    }, [data]);

    const totalPatients = useMemo(() => {
        return sourceData.reduce((sum, item) => sum + item.patientCount, 0);
    }, [sourceData]);

    const processedData = useMemo(() => {
        const sorted = [...sourceData].sort((a, b) => {
            if (sortMode === "desc") return b.patientCount - a.patientCount;
            if (sortMode === "asc") return a.patientCount - b.patientCount;
            return a.name.localeCompare(b.name);
        });

        const sliced = limit === "all" ? sorted : sorted.slice(0, limit);

        return sliced.map((item) => ({
            ...item,
            shortName: item.name.replace(/^Dr\.\s+/i, ""),
            sharePercent:
                totalPatients > 0
                    ? Math.round((item.patientCount / totalPatients) * 100)
                    : 0,
        }));
    }, [sourceData, sortMode, limit, totalPatients]);

    const handleCycleSort = () => {
        setSortMode((prev) =>
            prev === "desc" ? "asc" : prev === "asc" ? "name" : "desc"
        );
    };

    const sortLabel =
        sortMode === "desc"
            ? "Highest Load"
            : sortMode === "asc"
                ? "Lowest Load"
                : "Name (A–Z)";

    const avgPerDoctor =
        sourceData.length > 0 ? (totalPatients / sourceData.length).toFixed(1) : "0";

    return (
        <section className="patientsperdoctorchart_card_div p-5 sm:p-6 space-y-5">
            {/* Header */}
            <div className="patientsperdoctorchart_header_div flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="patientsperdoctorchart_titlegroup_div space-y-1">
                    <div className="patientsperdoctorchart_titlebar_div flex items-center gap-2">
                        <span className="patientsperdoctorchart_iconwrap_span w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Stethoscope className="patientsperdoctorchart_titleicon_svg w-4 h-4" />
                        </span>
                        <h3 className="patientsperdoctorchart_title_h3 text-base sm:text-lg font-bold tracking-tight text-slate-900">
                            {title}
                        </h3>
                    </div>
                    <p className="patientsperdoctorchart_subtitle_p text-xs sm:text-sm text-slate-500">
                        {subtitle}
                    </p>
                </div>

                {/* Controls: Sort & Limit */}
                <div className="patientsperdoctorchart_controls_div flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={handleCycleSort}
                        className="patientsperdoctorchart_sortbtn_button inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold cursor-pointer"
                    >
                        <ArrowUpDown className="patientsperdoctorchart_sorticon_svg w-3.5 h-3.5" />
                        <span className="patientsperdoctorchart_sorttext_span">
                            {sortLabel}
                        </span>
                    </button>

                    <div
                        role="group"
                        aria-label="Number of doctors shown"
                        className="patientsperdoctorchart_limitgroup_div inline-flex items-center gap-0.5"
                    >
                        {(
                            [
                                { value: 5, label: "Top 5" },
                                { value: 8, label: "Top 8" },
                                { value: "all", label: "All" },
                            ] as const
                        ).map((opt) => {
                            const active = limit === opt.value;
                            return (
                                <button
                                    key={String(opt.value)}
                                    type="button"
                                    onClick={() => setLimit(opt.value)}
                                    className={`patientsperdoctorchart_limitbtn_button px-2.5 py-1 text-xs font-semibold cursor-pointer ${active ? "patientsperdoctorchart_limitbtn_active_button" : ""
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Summary Strip */}
            <div className="patientsperdoctorchart_summary_div flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="patientsperdoctorchart_summaryleft_div flex items-center gap-4">
                    <span className="patientsperdoctorchart_avgitem_span text-slate-600">
                        Avg / Doctor:{" "}
                        <strong className="patientsperdoctorchart_avgval_strong text-slate-900 tabular-nums">
                            {avgPerDoctor}
                        </strong>
                    </span>
                    <span className="patientsperdoctorchart_doccount_span text-slate-600">
                        Active Doctors:{" "}
                        <strong className="patientsperdoctorchart_docval_strong text-slate-900 tabular-nums">
                            {sourceData.length}
                        </strong>
                    </span>
                </div>

                {onSelectDoctor && (
                    <span className="patientsperdoctorchart_hint_span inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <MousePointerClick className="patientsperdoctorchart_hinticon_svg w-3.5 h-3.5" />
                        Click a bar to inspect doctor
                    </span>
                )}
            </div>

            {/* Bar Chart */}
            <div className="patientsperdoctorchart_canvas_div w-full h-72 sm:h-80">
                {isLoading ? (
                    <div className="patientsperdoctorchart_skeleton_div w-full h-full rounded-xl bg-slate-100 animate-pulse flex items-center justify-center text-xs font-medium text-slate-400">
                        Loading doctor workload distribution...
                    </div>
                ) : processedData.length === 0 ? (
                    <div className="patientsperdoctorchart_empty_div w-full h-full rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-1.5 text-center p-4">
                        <Stethoscope className="patientsperdoctorchart_emptyicon_svg w-6 h-6 text-slate-300" />
                        <p className="patientsperdoctorchart_emptytitle_p text-sm font-medium text-slate-600">
                            No doctor caseload data available
                        </p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={processedData}
                            margin={{ top: 10, right: 16, left: 4, bottom: 20 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#e2e8f0"
                            />
                            <XAxis
                                dataKey="shortName"
                                interval={0}
                                angle={processedData.length > 5 ? -18 : 0}
                                textAnchor={processedData.length > 5 ? "end" : "middle"}
                                tick={{ fill: "#475569", fontSize: 12 }}
                                axisLine={{ stroke: "#e2e8f0" }}
                                tickLine={false}
                            />
                            <YAxis
                                allowDecimals={false}
                                tick={{ fill: "#64748b", fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                content={<CustomDoctorTooltip />}
                                cursor={{ fill: "rgba(241, 245, 249, 0.75)" }}
                            />
                            <Bar
                                dataKey="patientCount"
                                name="Patients"
                                radius={[8, 8, 0, 0]}
                                maxBarSize={42}
                                onClick={(barData) => {
                                    if (onSelectDoctor && barData?.payload) {
                                        onSelectDoctor(barData.payload as DoctorWorkloadItem);
                                    }
                                }}
                                className={onSelectDoctor ? "cursor-pointer" : ""}
                            >
                                {processedData.map((entry, index) => (
                                    <Cell
                                        key={entry.id}
                                        fill={BAR_PALETTE[index % BAR_PALETTE.length]}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </section>
    );
};

export default PatientsPerDoctorChart;