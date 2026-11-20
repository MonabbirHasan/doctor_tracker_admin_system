import api from "@/lib/api";
import type {
  PaginationMeta,
  PatientCondition,
  PatientGender,
} from "./doctor.service";

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: PatientGender;
  phone: string;
  email?: string;
  doctorId: string;
  doctorName: string;
  specialization?: string;
  condition: PatientCondition;
  admissionDate: string;
  notes?: string;
}

export interface PatientListParams {
  search?: string;
  condition?: PatientCondition | "";
  doctorId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PatientListResponse {
  success: boolean;
  data: PatientRecord[];
  pagination: PaginationMeta;
}

export interface PatientMutationPayload {
  name: string;
  age: number;
  gender: PatientGender;
  phone: string;
  email?: string;
  doctorId: string;
  condition: PatientCondition;
  admissionDate: string;
  notes?: string;
}

export const patientService = {
    //========================================
  // FETCH ALL PATIENTS SERVICE
  //========================================
  async getAll(params: PatientListParams = {}): Promise<PatientListResponse> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== "" && v !== undefined),
    );
    const { data } = await api.get<PatientListResponse>("/patients/all", {
      params: cleanParams,
    });
    return data;
  },
  
    //========================================
  // CREATE PATIENT SERVICE
  //========================================
  async create(payload: PatientMutationPayload): Promise<PatientRecord> {
    const { data } = await api.post<{ success: boolean; data: PatientRecord }>(
      "/patients/create",
      payload,
    );
    return data.data;
  },

    //========================================
  // UPDATE PATIENT SERVICE
  //========================================
  async update(
    patientId: string,
    payload: Partial<PatientMutationPayload>,
  ): Promise<PatientRecord> {
    const { data } = await api.put<{ success: boolean; data: PatientRecord }>(
      `/patients/update/${patientId}`,
      payload,
    );
    return data.data;
  },

    //========================================
  // DELETE PATIENT SERVICE
  //========================================
  async remove(patientId: string): Promise<void> {
    await api.delete(`/patients/delete/${patientId}`);
  },
};
