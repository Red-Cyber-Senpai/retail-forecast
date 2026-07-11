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
});

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          toast.error("Session expired. Please login again.");
          localStorage.clear();
          window.location.href = "/login";
          break;

        case 403:
          toast.error("You don't have permission.");
          break;

        case 404:
          toast.error("Resource not found.");
          break;

        case 500:
          toast.error("Internal server error.");
          break;

        default:
          toast.error(
            error.response.data?.detail ||
            "Something went wrong."
          );
      }
    } else {
      toast.error("Backend server is unreachable.");
    }

    return Promise.reject(error);
  }
);

export default api;