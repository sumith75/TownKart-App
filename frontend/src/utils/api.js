import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ,
    headers: { "Content-Type": "application/json" },
});

// Auto-attach JWT token to every requestt
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("tk_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Global 401 handler
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("tk_token");
            localStorage.removeItem("tk_user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
