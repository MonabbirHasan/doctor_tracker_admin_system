import api from "@/lib/api";
import type { PatientCondition } from "./doctor.service";

export interface AnalyticsSummary {
  totalDoctors: number;
  totalPatients: number;
  criticalPatients: number;
  monitoringPatients: number;
}

export interface DoctorCaseloadMetric {
  doctorId: string;
  doctorName: string;
  specialization: string;
  patients: number;
}

export interface MonthlyAdmissionMetric {
  month: string;
  patients: number;
}

export interface AnalyticsOverviewData {
  summary: AnalyticsSummary;
  conditionBreakdown: Record<PatientCondition, number>;
  patientsPerDoctor: DoctorCaseloadMetric[];
  monthlyGrowth: MonthlyAdmissionMetric[];
}

export interface AnalyticsOverviewResponse {
  success: boolean;
  data: AnalyticsOverviewData;
}

export const analyticsService = {
  async getOverview(): Promise<AnalyticsOverviewData> {
    const { data } = await api.get<AnalyticsOverviewResponse>(
      "/analytics/overview",
    );
    return data.data;
  },
};
