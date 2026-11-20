import api from "@/lib/api";

export type PatientCondition =
  "Stable" | "Monitoring" | "Critical" | "Recovering";

export type PatientGender = "Male" | "Female" | "Other";

export interface AssignedPatient {
  id: string;
  name: string;
  age: number;
  gender: PatientGender;
  phone: string;
  email?: string;
  condition: PatientCondition;
  admissionDate: string;
  notes?: string;
}

export interface DoctorRecord {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  joinedDate: string;
  patients: AssignedPatient[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DoctorListParams {
  search?: string;
  specialization?: string;
  hospital?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface DoctorListResponse {
  success: boolean;
  data: DoctorRecord[];
  pagination: PaginationMeta;
}

export interface DoctorMutationPayload {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
}

export interface AssignPatientPayload {
  name: string;
  age: number;
  gender: PatientGender;
  phone: string;
  email?: string;
  condition?: PatientCondition;
  admissionDate?: string;
  notes?: string;
}

export const doctorService = {
    //========================================
  // FETCH ALL DOCTORS SERVICE
  //========================================
  async getAll(params: DoctorListParams = {}): Promise<DoctorListResponse> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== "" && v !== undefined),
    );
    const { data } = await api.get<DoctorListResponse>("/doctors/all", {
      params: cleanParams,
    });
    return data;
  },
  
  //========================================
  // CREATE DOCTOR SERVICE
  //========================================
  async create(payload: DoctorMutationPayload): Promise<DoctorRecord> {
    const { data } = await api.post<{ success: boolean; data: DoctorRecord }>(
      "/doctors/create",
      payload,
    );
    return data.data;
  },

  //========================================
  // UPDATE DOCTOR SERVICE
  //========================================
  async update(
    doctorId: string,
    payload: Partial<DoctorMutationPayload>,
  ): Promise<DoctorRecord> {
    const { data } = await api.put<{ success: boolean; data: DoctorRecord }>(
      `/doctors/update/${doctorId}`,
      payload,
    );
    return data.data;
  },

  //===============================
  // REMOVE DOCTOR SERVICE
  //===============================
  async remove(doctorId: string): Promise<void> {
    await api.delete(`/doctors/delete/${doctorId}`);
  },

  //========================================
  // ASSING PATIENT TO DOCTOR SERVICE
  //========================================
  async assignPatient(
    doctorId: string | { id?: string; _id?: string },
    payload: AssignPatientPayload,
  ): Promise<AssignedPatient> {
    const cleanId =
      typeof doctorId === "string"
        ? doctorId.trim()
        : (doctorId?.id || doctorId?._id || "").trim();

    if (!cleanId || cleanId === "[object Object]") {
      throw new Error("A valid doctor ID is required to assign a patient.");
    }

    const { data } = await api.post<{
      success: boolean;
      data: AssignedPatient;
    }>(`/doctors/assign_patient/${encodeURIComponent(cleanId)}`, payload);

    return data.data;
  },

  //========================================
  // REMOVE PATIENT FROM DOCTORS
  //========================================
  async removePatient(doctorId: string, patientId: string): Promise<void> {
    await api.delete(`/doctors/delete/${doctorId}/patients/${patientId}`);
  },
};
