import axios from "axios";
import { handleMock, setDemoMode } from "./mock.js";

// All API calls go through this client. The base URL points at the Spring
// Boot backend, the token is attached to every request.
const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && !config.anonymous) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token expired or is missing, go back to the login page
api.interceptors.response.use(
  (response) => {
    // Real server responded: turn offline demo mode off.
    setDemoMode(false);
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
    // Backend not connected: serve the mock dataset instead (login is
    // handled separately in Login.jsx with the dummy Owner credential).
    if (!error.response && error.request && error.config) {
      const url = error.config.url || "";
      if (!url.includes("/auth/login")) {
        const mocked = handleMock(
          error.config.method || "GET",
          url,
          error.config.params,
          typeof error.config.data === "string" ? JSON.parse(error.config.data) : error.config.data
        );
        if (mocked) {
          setDemoMode(true);
          return Promise.resolve({
            data: mocked.data,
            status: mocked.status,
            statusText: "OK (offline demo)",
            headers: {},
            config: error.config,
            mocked: true,
          });
        }
      }
    }
    return Promise.reject(error);
  }
);

// Extracts the { message } from an error response
export function errorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  if (error.request && !error.response) {
    return "Cannot reach the server. Is the backend running?";
  }
  return fallback;
}

export function formatMoney(value) {
  const number = Number(value || 0);
  return number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default api;
