import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const detail = error.response.data?.detail || "Something went wrong.";

      switch (status) {
        case 401:
          // Avoid redirect loop if already on login page
          if (!window.location.pathname.includes("/login")) {
            toast.error("Session expired. Please log in again.");
            localStorage.clear();
            window.location.href = "/login";
          }
          break;
        case 403:
          toast.error("Access denied. Insufficient permissions.");
          break;
        case 404:
          toast.error("Requested resource not found.");
          break;
        case 422:
          toast.error(`Validation Error: ${JSON.stringify(error.response.data?.detail)}`);
          break;
        case 500:
          toast.error("Internal server error. Please try again later.");
          break;
        default:
          toast.error(detail);
      }
    } else {
      toast.error("Backend server is unreachable. Please verify it is running.");
    }
    return Promise.reject(error);
  }
);

export default api;
