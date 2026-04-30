import axios from "axios";
import { useAuthToken } from "./auth.store";
import { ENV } from "../config/env";

export const api = axios.create({
  baseURL: `http://${ENV.backend_url}`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((req) => {
  const token = useAuthToken.getState().accessToken;

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
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh"
    ) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(`http://${ENV.backend_url}/api/auth/refresh`);
        const { accessToken } = response.data;
        useAuthToken.getState().setToken(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthToken.getState().clearToken();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
