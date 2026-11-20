import api from "@/lib/api";
import type { AuthUser } from "@/store/useAuthStore";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SeedAdminPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

export interface CurrentAdminResponse {
  success: boolean;
  user: AuthUser;
}

export const authService = {
  //============================
  // ADMIN LOGIN SERVICE
  //============================
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  },
  //============================
  // INITIALIZE LOGIN SERVICE
  //============================
  async seedAdmin(payload: SeedAdminPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/seed-admin", payload);
    return data;
  },
  //============================
  // GET CURRENT ADMIN INFO
  //============================
  async getCurrentAdmin(): Promise<CurrentAdminResponse> {
    const { data } = await api.get<CurrentAdminResponse>("/auth/me");
    return data;
  },
};
