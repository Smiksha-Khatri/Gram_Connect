import axios from "axios";

const BACKEND_URL =
  (typeof process !== "undefined" &&
    process.env &&
    (process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL)) ||
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_BACKEND_URL) ||
  "http://localhost:8000";

const baseURL = BACKEND_URL.replace(/\/+$/, "") + "/api";

const API = axios.create({
  baseURL,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
