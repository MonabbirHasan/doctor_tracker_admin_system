"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Stethoscope,
    Users,
    Activity,
    UserPlus,
    RefreshCw,
    ArrowUpRight,
    CalendarClock,
    ClipboardList,
} from "lucide-react";
import "./DashboardPage.css";
import { extractApiErrorMessage } from "@/lib/api";
import {
    analyticsService,
    patientService,
    type AnalyticsOverviewData,
    type PatientCondition,
    type PatientRecord,
} from "@/services";
import GrowthChart, {
    type GrowthDataPoint,
} from "@/components/dashboard/GrowthChart";
import PatientsPerDoctorChart, {
    type DoctorWorkloadItem,
} from "@/components/dashboard/PatientsPerDoctorChart";
import StatCard from "@/components/dashboard/StatCard";

interface RecentIntakeRow {
    id: string;
    patientName: string;
    doctorName: string;
    specialization: string;
    condition: PatientCondition;
    registeredAt: string;
}

const CONDITION_BADGE_MAP: Record<PatientCondition, string> = {
    Stable: "dashboardpage_status_stable_span",
    Monitoring: "dashboardpage_status_monitoring_span",
    Critical: "dashboardpage_status_critical_span",
    Recovering: "dashboardpage_status_recovering_span",
};
  //============================
  // DATE FORMATER
  //============================
function formatDisplayDate(isoDate: string): string {
    if (!isoDate) return "—";
    const parsed = new Date(`${isoDate}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return isoDate;
    return parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

const DashboardPage = () => {
    const router = useRouter();
    const [overview, setOverview] = useState<AnalyticsOverviewData | null>(null);
    const [recentPatients, setRecentPatients] = useState<PatientRecord[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  //============================
  // FETCH ANALYTICS DATA
  //============================
    const loadDashboardData = useCallback(async (isManualRefresh = false) => {
        if (isManualRefresh) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }

        try {
            const [analyticsRes, patientsRes] = await Promise.all([
                analyticsService.getOverview(),
                patientService.getAll({ page: 1, limit: 5 }),
            ]);

            setOverview(analyticsRes);
            setRecentPatients(patientsRes.data);
        } catch (error) {
            toast.error(
                extractApiErrorMessage(error, "Failed to load dashboard analytics.")
            );
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData(false);
    }, [loadDashboardData]);

    const totalDoctors = overview?.summary.totalDoctors ?? 0;
    const totalPatients = overview?.summary.totalPatients ?? 0;

    const averagePatientsPerDoctor = useMemo(() => {
        if (totalDoctors === 0) return "0";
        return (totalPatients / totalDoctors).toFixed(1);
    }, [totalDoctors, totalPatients]);

    const growthChartData: GrowthDataPoint[] = useMemo(() => {
        if (!overview?.monthlyGrowth?.length) return [];
        return overview.monthlyGrowth.map((item) => ({
            date: item.month,
            patients: item.patients,
            doctors: totalDoctors,
        }));
    }, [overview, totalDoctors]);

    const doctorWorkloadData: DoctorWorkloadItem[] = useMemo(() => {
        if (!overview?.patientsPerDoctor?.length) return [];
        return overview.patientsPerDoctor.map((doc) => ({
            id: doc.doctorId,
            name: doc.doctorName,
            specialization: doc.specialization,
            hospital: "",
            patientCount: doc.patients,
        }));
    }, [overview]);

    const recentIntakes: RecentIntakeRow[] = useMemo(() => {
        return recentPatients.map((pt) => ({
            id: pt.id,
            patientName: pt.name,
            doctorName: pt.doctorName,
            specialization: pt.specialization || "General",
            condition: pt.condition,
            registeredAt: formatDisplayDate(pt.admissionDate),
        }));
    }, [recentPatients]);

    const busyState = isLoading || isRefreshing;

    const handleRefresh = async () => {
        await loadDashboardData(true);
    };

    const handleSelectDoctorFromChart = (doctor: DoctorWorkloadItem) => {
        router.push(`/doctors/${doctor.id}`);
    };

    return (
        <div className="dashboardpage_wrapper_div min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Top Page Header */}
            <header className="dashboardpage_header_div flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="dashboardpage_titlegroup_div space-y-1">
                    <div className="dashboardpage_badge_div inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                        <CalendarClock className="dashboardpage_badgesvg_svg w-3.5 h-3.5" />
                        <span className="dashboardpage_badgetext_span">
                            Real-Time Clinical Overview
                        </span>
                    </div>
                    <h1 className="dashboardpage_title_h1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                        Admin Dashboard
                    </h1>
                    <p className="dashboardpage_subtitle_p text-xs sm:text-sm text-slate-500">
                        Monitor specialist roster counts, patient caseloads, and date-wise
                        growth metrics.
                    </p>
                </div>

                <div className="dashboardpage_actions_div flex flex-wrap items-center gap-2.5">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={busyState}
                        className="dashboardpage_secondarybtn_button inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold cursor-pointer disabled:opacity-60"
                    >
                        <RefreshCw
                            className={`dashboardpage_refreshsvg_svg w-4 h-4 ${busyState ? "animate-spin" : ""
                                }`}
                        />
                        <span className="dashboardpage_refreshtext_span">Sync Data</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/doctors")}
                        className="dashboardpage_primarybtn_button inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold cursor-pointer"
                    >
                        <UserPlus className="dashboardpage_addsvg_svg w-4 h-4" />
                        <span className="dashboardpage_addtext_span">Manage Doctors</span>
                    </button>
                </div>
            </header>

            {/* KPI Summary Cards */}
            <section
                aria-label="Key Performance Metrics"
                className="dashboardpage_statsgrid_section grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
            >
                <StatCard
                    title="Total Doctors"
                    value={totalDoctors}
                    subtitle="Active specialists"
                    trendValue="Live"
                    trendDirection="up"
                    tone="primary"
                    isLoading={busyState}
                    icon={<Stethoscope className="dashboardpage_statdoc_svg w-5 h-5" />}
                    onClick={() => router.push("/doctors")}
                />

                <StatCard
                    title="Total Patients"
                    value={totalPatients}
                    subtitle="Assigned across roster"
                    trendValue={`${overview?.summary.criticalPatients ?? 0} Critical`}
                    trendDirection="up"
                    tone="success"
                    isLoading={busyState}
                    icon={<Users className="dashboardpage_statpt_svg w-5 h-5" />}
                    onClick={() => router.push("/patients")}
                />

                <StatCard
                    title="Avg. Patients / Doctor"
                    value={averagePatientsPerDoctor}
                    subtitle="Caseload balance ratio"
                    trendValue={`${overview?.summary.monitoringPatients ?? 0} Monitoring`}
                    trendDirection="neutral"
                    tone="warning"
                    isLoading={busyState}
                    icon={<Activity className="dashboardpage_statavg_svg w-5 h-5" />}
                />
            </section>

            {/* Primary Charts Grid */}
            <section
                aria-label="Analytics Charts"
                className="dashboardpage_chartsgrid_section grid grid-cols-1 xl:grid-cols-12 gap-6"
            >
                <div className="dashboardpage_growthcol_div xl:col-span-6">
                    <GrowthChart
                        data={growthChartData}
                        isLoading={busyState}
                        title="Date-Based Registration Trend"
                        subtitle="Monthly patient admission count from MongoDB"
                    />
                </div>

                <div className="dashboardpage_workloadcol_div xl:col-span-6">
                    <PatientsPerDoctorChart
                        data={doctorWorkloadData}
                        isLoading={busyState}
                        title="Patients per Doctor"
                        subtitle="Click any bar to inspect doctor caseload & patients"
                        onSelectDoctor={handleSelectDoctorFromChart}
                    />
                </div>
            </section>

            {/* Recent Patient Intakes Table */}
            <section
                aria-label="Recent Patient Intakes"
                className="dashboardpage_panel_div p-5 sm:p-6 space-y-4"
            >
                <div className="dashboardpage_tabletop_div flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="dashboardpage_tabletitlegroup_div flex items-center gap-2.5">
                        <span className="dashboardpage_tableicon_span w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <ClipboardList className="dashboardpage_tableicon_svg w-4 h-4" />
                        </span>
                        <div>
                            <h2 className="dashboardpage_tabletitle_h2 text-base sm:text-lg font-bold text-slate-900">
                                Recent Patient Admissions
                            </h2>
                            <p className="dashboardpage_tablesub_p text-xs text-slate-500">
                                Latest patients assigned to specialist physicians
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.push("/patients")}
                        className="dashboardpage_viewall_button inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer self-start sm:self-auto"
                    >
                        <span className="dashboardpage_viewalltext_span">
                            View All Patients
                        </span>
                        <ArrowUpRight className="dashboardpage_viewallsvg_svg w-4 h-4" />
                    </button>
                </div>

                <div className="dashboardpage_tablewrap_div overflow-x-auto">
                    <table className="dashboardpage_table_table w-full text-left border-collapse">
                        <thead>
                            <tr className="dashboardpage_theadrow_tr border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                <th className="dashboardpage_th_th py-3 pr-4">Patient</th>
                                <th className="dashboardpage_th_th py-3 px-4">Assigned Doctor</th>
                                <th className="dashboardpage_th_th py-3 px-4">Specialization</th>
                                <th className="dashboardpage_th_th py-3 px-4">Condition</th>
                                <th className="dashboardpage_th_th py-3 pl-4 text-right">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="dashboardpage_tbody_tbody divide-y divide-slate-100 text-sm">
                            {recentIntakes.length === 0 ? (
                                <tr className="dashboardpage_row_tr">
                                    <td
                                        colSpan={5}
                                        className="dashboardpage_td_td py-6 text-center text-xs sm:text-sm text-slate-400"
                                    >
                                        No recent patient admissions found.
                                    </td>
                                </tr>
                            ) : (
                                recentIntakes.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="dashboardpage_row_tr hover:bg-slate-50/80 transition-colors"
                                    >
                                        <td className="dashboardpage_td_td py-3.5 pr-4 font-semibold text-slate-900 whitespace-nowrap">
                                            {row.patientName}
                                        </td>
                                        <td className="dashboardpage_td_td py-3.5 px-4 text-slate-700 whitespace-nowrap">
                                            {row.doctorName}
                                        </td>
                                        <td className="dashboardpage_td_td py-3.5 px-4 text-slate-500 whitespace-nowrap">
                                            {row.specialization}
                                        </td>
                                        <td className="dashboardpage_td_td py-3.5 px-4 whitespace-nowrap">
                                            <span
                                                className={`dashboardpage_badge_span inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${CONDITION_BADGE_MAP[row.condition]
                                                    }`}
                                            >
                                                {row.condition}
                                            </span>
                                        </td>
                                        <td className="dashboardpage_td_td py-3.5 pl-4 text-right text-slate-500 tabular-nums whitespace-nowrap">
                                            {row.registeredAt}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default DashboardPage;