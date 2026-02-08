import axios from "axios";

// Use relative URL - Vite proxy will forward to backend
export const BASE_URL = "";
const API_URL = `/api/v1`;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
