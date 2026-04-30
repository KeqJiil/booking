import axios from "axios";
import { authToken } from "./auth.store";

export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((req) => {
  const token = authToken.getState().accessToken;

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh"
    ) {
      originalRequest._retry = true;
      try {
        const response = await axios.post("/api/auth/refresh");
        const { accessToken } = response.data;
        authToken.getState().setToken(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        authToken.getState().clearToken();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
