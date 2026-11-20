"use client";

import React, { useMemo, useState } from "react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import {
    TrendingUp,
    Calendar,
    BarChart3,
    Activity,
    Users,
    UserCheck,
} from "lucide-react";
import "./growthchart.css";

export interface GrowthDataPoint {
    date: string; // e.g., "Nov 01" or "2026-11-01"
    patients: number;
    doctors: number;
}

export type TimeRangeKey = "7d" | "30d" | "90d" | "1y";

interface GrowthChartProps {
    data?: GrowthDataPoint[];
    dataByRange?: Partial<Record<TimeRangeKey, GrowthDataPoint[]>>;
    defaultRange?: TimeRangeKey;
    title?: string;
    subtitle?: string;
    isLoading?: boolean;
    onRangeChange?: (range: TimeRangeKey) => void;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        name?: string;
        value?: number;
        dataKey?: string;
        color?: string;
    }>;
    label?: string;
}

const DEFAULT_MOCK_BY_RANGE: Record<TimeRangeKey, GrowthDataPoint[]> = {
    "7d": [
        { date: "Nov 13", patients: 24, doctors: 3 },
        { date: "Nov 14", patients: 31, doctors: 4 },
        { date: "Nov 15", patients: 28, doctors: 2 },
        { date: "Nov 16", patients: 42, doctors: 5 },
        { date: "Nov 17", patients: 37, doctors: 4 },
        { date: "Nov 18", patients: 49, doctors: 6 },
        { date: "Nov 19", patients: 54, doctors: 7 },
    ],
    "30d": [
        { date: "Week 1", patients: 145, doctors: 14 },
        { date: "Week 2", patients: 198, doctors: 19 },
        { date: "Week 3", patients: 234, doctors: 22 },
        { date: "Week 4", patients: 289, doctors: 27 },
    ],
    "90d": [
        { date: "Sep", patients: 510, doctors: 42 },
        { date: "Oct", patients: 685, doctors: 58 },
        { date: "Nov", patients: 842, doctors: 74 },
    ],
    "1y": [
        { date: "Jan", patients: 320, doctors: 28 },
        { date: "Mar", patients: 460, doctors: 39 },
        { date: "May", patients: 590, doctors: 48 },
        { date: "Jul", patients: 740, doctors: 61 },
        { date: "Sep", patients: 890, doctors: 73 },
        { date: "Nov", patients: 1120, doctors: 89 },
    ],
};

const RANGE_OPTIONS: { key: TimeRangeKey; label: string }[] = [
    { key: "7d", label: "7D" },
    { key: "30d", label: "30D" },
    { key: "90d", label: "90D" },
    { key: "1y", label: "1Y" },
];

const CustomGrowthTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label,
}) => {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const patientsItem = payload.find((item) => item.dataKey === "patients");
    const doctorsItem = payload.find((item) => item.dataKey === "doctors");

    return (
        <div className="growthchart_tooltip_div p-3 text-xs space-y-2">
            <div className="growthchart_tooltipheader_div flex items-center justify-between gap-3 border-b border-slate-100 pb-1.5 font-semibold text-slate-800">
                <span className="growthchart_tooltiplabel_span">{label}</span>
                <Calendar className="growthchart_tooltipcal_svg w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="growthchart_tooltiprows_div space-y-1.5">
                {patientsItem && (
                    <div className="growthchart_tooltiprow_div flex items-center justify-between gap-4">
                        <span className="growthchart_tooltipkey_span inline-flex items-center gap-1.5 text-slate-600">
                            <span className="growthchart_dot_patients_span w-2 h-2 rounded-full inline-block" />
                            Patients
                        </span>
                        <span className="growthchart_tooltipval_span font-bold text-slate-900 tabular-nums">
                            {Number(patientsItem.value ?? 0).toLocaleString()}
                        </span>
                    </div>
                )}

                {doctorsItem && (
                    <div className="growthchart_tooltiprow_div flex items-center justify-between gap-4">
                        <span className="growthchart_tooltipkey_span inline-flex items-center gap-1.5 text-slate-600">
                            <span className="growthchart_dot_doctors_span w-2 h-2 rounded-full inline-block" />
                            Doctors
                        </span>
                        <span className="growthchart_tooltipval_span font-bold text-slate-900 tabular-nums">
                            {Number(doctorsItem.value ?? 0).toLocaleString()}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

const GrowthChart: React.FC<GrowthChartProps> = ({
    data,
    dataByRange,
    defaultRange = "30d",
    title = "Date-Based Clinical Growth",
    subtitle = "Patient registrations and doctor onboarding over time",
    isLoading = false,
    onRangeChange,
}) => {
    const [selectedRange, setSelectedRange] = useState<TimeRangeKey>(defaultRange);
    const [chartType, setChartType] = useState<"area" | "bar">("area");
    const [showPatients, setShowPatients] = useState(true);
    const [showDoctors, setShowDoctors] = useState(true);

    const chartData = useMemo<GrowthDataPoint[]>(() => {
        if (data && data.length > 0) return data;
        if (dataByRange && dataByRange[selectedRange]?.length) {
            return dataByRange[selectedRange]!;
        }
        return DEFAULT_MOCK_BY_RANGE[selectedRange] ?? [];
    }, [data, dataByRange, selectedRange]);

    const summary = useMemo(() => {
        const totalPatients = chartData.reduce((acc, row) => acc + row.patients, 0);
        const totalDoctors = chartData.reduce((acc, row) => acc + row.doctors, 0);
        return { totalPatients, totalDoctors };
    }, [chartData]);

    const handleSelectRange = (range: TimeRangeKey) => {
        setSelectedRange(range);
        onRangeChange?.(range);
    };

    const handleToggleChartType = () => {
        setChartType((prev) => (prev === "area" ? "bar" : "area"));
    };

    return (
        <section className="growthchart_card_div p-5 sm:p-6 space-y-5">
            {/* Header Row */}
            <div className="growthchart_header_div flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="growthchart_titlegroup_div space-y-1">
                    <div className="growthchart_titlebadge_div flex items-center gap-2">
                        <span className="growthchart_iconwrap_span w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <TrendingUp className="growthchart_titleicon_svg w-4 h-4" />
                        </span>
                        <h3 className="growthchart_title_h3 text-base sm:text-lg font-bold tracking-tight text-slate-900">
                            {title}
                        </h3>
                    </div>
                    <p className="growthchart_subtitle_p text-xs sm:text-sm text-slate-500">
                        {subtitle}
                    </p>
                </div>

                {/* Controls: Time Range + Chart Type Switch */}
                <div className="growthchart_controls_div flex flex-wrap items-center gap-2">
                    <div
                        role="group"
                        aria-label="Select date range"
                        className="growthchart_segmented_div inline-flex items-center gap-0.5"
                    >
                        {RANGE_OPTIONS.map((item) => {
                            const isActive = selectedRange === item.key;
                            return (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => handleSelectRange(item.key)}
                                    className={`growthchart_rangebtn_button px-2.5 py-1 text-xs font-semibold cursor-pointer ${isActive ? "growthchart_rangebtn_active_button" : ""
                                        }`}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={handleToggleChartType}
                        title={
                            chartType === "area"
                                ? "Switch to Bar Chart"
                                : "Switch to Area Chart"
                        }
                        className="growthchart_modebtn_button inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold cursor-pointer"
                    >
                        {chartType === "area" ? (
                            <>
                                <BarChart3 className="growthchart_modeicon_svg w-3.5 h-3.5" />
                                <span className="growthchart_modetext_span">Bar View</span>
                            </>
                        ) : (
                            <>
                                <Activity className="growthchart_modeicon_svg w-3.5 h-3.5" />
                                <span className="growthchart_modetext_span">Area View</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Interactive Series Pills & Period Totals */}
            <div className="growthchart_legendbar_div flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
                <div className="growthchart_pills_div flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowPatients((prev) => !prev)}
                        className={`growthchart_pill_button inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${showPatients
                            ? "bg-blue-50/80 border-blue-200 text-blue-700"
                            : "bg-slate-50 border-slate-200 text-slate-400 line-through"
                            }`}
                    >
                        <Users className="growthchart_pillicon_svg w-3.5 h-3.5" />
                        <span className="growthchart_pilllabel_span">Patients</span>
                        <span className="growthchart_pillcount_span font-bold tabular-nums">
                            {summary.totalPatients.toLocaleString()}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowDoctors((prev) => !prev)}
                        className={`growthchart_pill_button inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${showDoctors
                            ? "bg-emerald-50/80 border-emerald-200 text-emerald-700"
                            : "bg-slate-50 border-slate-200 text-slate-400 line-through"
                            }`}
                    >
                        <UserCheck className="growthchart_pillicon_svg w-3.5 h-3.5" />
                        <span className="growthchart_pilllabel_span">Doctors</span>
                        <span className="growthchart_pillcount_span font-bold tabular-nums">
                            {summary.totalDoctors.toLocaleString()}
                        </span>
                    </button>
                </div>

                <span className="growthchart_rangehint_span text-[11px] font-medium text-slate-400">
                    Click series pills to toggle visibility
                </span>
            </div>

            {/* Chart Canvas */}
            <div className="growthchart_canvas_div w-full h-72 sm:h-80">
                {isLoading ? (
                    <div className="growthchart_skeleton_div w-full h-full rounded-xl bg-slate-100 animate-pulse flex items-center justify-center text-xs font-medium text-slate-400">
                        Loading growth analytics...
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="growthchart_empty_div w-full h-full rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-1.5 text-center p-4">
                        <TrendingUp className="growthchart_emptyicon_svg w-6 h-6 text-slate-300" />
                        <p className="growthchart_emptytitle_p text-sm font-medium text-slate-600">
                            No growth data for this period
                        </p>
                        <p className="growthchart_emptysub_p text-xs text-slate-400">
                            Try switching to a wider date range or add records.
                        </p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === "area" ? (
                            <AreaChart
                                data={chartData}
                                margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient
                                        id="growthPatientsGrad"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01} />
                                    </linearGradient>
                                    <linearGradient
                                        id="growthDoctorsGrad"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.24} />
                                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0.01} />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#e2e8f0"
                                />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: "#64748b", fontSize: 12 }}
                                    axisLine={{ stroke: "#e2e8f0" }}
                                    tickLine={false}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tick={{ fill: "#64748b", fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomGrowthTooltip />} />

                                {showPatients && (
                                    <Area
                                        type="monotone"
                                        dataKey="patients"
                                        name="Patients"
                                        stroke="#2563eb"
                                        strokeWidth={2.5}
                                        fillOpacity={1}
                                        fill="url(#growthPatientsGrad)"
                                        activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff" }}
                                    />
                                )}

                                {showDoctors && (
                                    <Area
                                        type="monotone"
                                        dataKey="doctors"
                                        name="Doctors"
                                        stroke="#16a34a"
                                        strokeWidth={2.2}
                                        fillOpacity={1}
                                        fill="url(#growthDoctorsGrad)"
                                        activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff" }}
                                    />
                                )}
                            </AreaChart>
                        ) : (
                            <BarChart
                                data={chartData}
                                margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
                                barGap={6}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#e2e8f0"
                                />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: "#64748b", fontSize: 12 }}
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
                                    content={<CustomGrowthTooltip />}
                                    cursor={{ fill: "rgba(241, 245, 249, 0.7)" }}
                                />

                                {showPatients && (
                                    <Bar
                                        dataKey="patients"
                                        name="Patients"
                                        fill="#2563eb"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={28}
                                    />
                                )}

                                {showDoctors && (
                                    <Bar
                                        dataKey="doctors"
                                        name="Doctors"
                                        fill="#16a34a"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={28}
                                    />
                                )}
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                )}
            </div>
        </section>
    );
};

export default GrowthChart;