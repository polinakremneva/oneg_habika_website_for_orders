import axios from "axios";
import { authService } from "./auth.service";

const createAPI = () => {
  const api = axios.create({
    baseURL:
      process.env.NODE_ENV === "production" ? "/api" : "//localhost:3000/api",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  api.interceptors.request.use(
    (config) => {
      const token = authService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        authService.logout().then(() => {
          window.location.href = "/auth/login";
        });
      }
      return Promise.reject(error);
    }
  );

  return api;
};

export const api = createAPI();
