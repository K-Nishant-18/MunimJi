import axios from "axios";

// All API calls go through this client. The base URL points at the Spring
// Boot backend, the token is attached to every request.
const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token expired or is missing, go back to the login page
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
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
