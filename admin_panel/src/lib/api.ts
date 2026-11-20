import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/store/useAuthStore";

export interface ApiErrorResponse {
  success?: boolean;
  message?: string;
  errors?: string[];
  statusCode?: number;
}

const API_BASE_URL =
"/api/auth/login";

const AUTH_ENDPOINTS_WITHOUT_REDIRECT = ["/auth/login", "/auth/seed-admin"];

let isHandlingUnauthorized = false;
//=========================
// GET CURRENT USER TOKEN
//=========================
function getCurrentToken(): string | null {
  const storeToken = useAuthStore.getState().token;
  if (storeToken) return storeToken;

  if (typeof window !== "undefined") {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith("dt_auth_token="));
    if (match) {
      const cookieVal = decodeURIComponent(match.split("=")[1] || "");
      if (cookieVal) return cookieVal;
    }
  }

  return null;
}
//============================================
// REDIRECT TO LOGIN ON UNAUTHORIZED
//============================================
function redirectToLoginOnUnauthorized() {
  if (typeof window === "undefined") return;
  if (isHandlingUnauthorized) return;

  isHandlingUnauthorized = true;
  useAuthStore.getState().clearAuthSession();

  const currentPath = window.location.pathname + window.location.search;
  if (!window.location.pathname.startsWith("/login")) {
    const nextParam =
      currentPath && currentPath !== "/"
        ? `?next=${encodeURIComponent(currentPath)}`
        : "";
    window.location.replace(`/login${nextParam}`);
  }

  window.setTimeout(() => {
    isHandlingUnauthorized = false;
  }, 1000);
}
//============================================
// EXTRA API REPONSE TO MAKE READBLE
//============================================
export function extractApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data;
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors.join(", ");
    }
    if (data?.message) {
      return data.message;
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
//============================================
// SETUP AXIOS INSTANCE FOR HOLE APP
//============================================
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

//============================================
// BEARER TOKEN VERIFICCATION
//============================================
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getCurrentToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response interceptor: normalize errors & handle 401 session expiration
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    const isAuthAttempt = AUTH_ENDPOINTS_WITHOUT_REDIRECT.some((path) =>
      requestUrl.includes(path),
    );

    if (status === 401 && !isAuthAttempt) {
      redirectToLoginOnUnauthorized();
    }

    const normalizedMessage = extractApiErrorMessage(error);
    const enrichedError = Object.assign(error, {
      userMessage: normalizedMessage,
      statusCode: status,
    });

    return Promise.reject(enrichedError);
  },
);

export default api;
