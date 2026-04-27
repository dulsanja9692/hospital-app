import axios from "axios";

const rawBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://hospital-managemnt-system.vercel.app/api/v1";

const BASE_URL = rawBaseUrl.endsWith("/") ? rawBaseUrl : `${rawBaseUrl}/`;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
});

// ── In-memory token storage (never localStorage) ──────────
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};
export const getAccessToken = () => accessToken;

// ── Attach token & debug logging ──────────────────────────
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  const fullUrl = `${config.baseURL}${config.url}`;
  console.log(`[API Request] ${config.method?.toUpperCase()} ${fullUrl}`, {
    hasToken: !!accessToken,
    headers: config.headers
  });
  return config;
});

// ── Auto-refresh on 401 ───────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const res = await api.post("auth/refresh");
        const newToken = res.data.data.accessToken;
        setAccessToken(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        setAccessToken(null);
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
