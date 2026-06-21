import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`📡 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error("❌ Request timeout");
      return Promise.reject(new Error("Request timeout. Please try again."));
    }

    if (error.response) {
      // Server responded with error status
      console.error(
        `❌ ${error.response.status}: ${error.response.data.message || error.response.statusText}`,
      );
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request was made but no response
      console.error("❌ No response from server. Is backend running?");
      return Promise.reject(
        new Error(
          "Cannot connect to server. Please check if backend is running.",
        ),
      );
    } else {
      // Something else happened
      console.error("❌ Error:", error.message);
      return Promise.reject(error);
    }
  },
);

// Categories API
export const categoriesAPI = {
  getAll: () => api.get("/categories"),
  getByType: (type) => api.get(`/categories/type/${type}`),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Transactions API
export const transactionsAPI = {
  getAll: (params) => api.get("/transactions", { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post("/transactions", data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getBalance: () => api.get("/analytics/balance"),
  getSummary: (params) => api.get("/analytics/summary", { params }),
  getMonthly: (params) => api.get("/analytics/monthly", { params }),
  export: (params) => api.get("/export", { params }),
};

// Health check
export const healthAPI = {
  check: () => api.get("/health"),
};

export default api;
