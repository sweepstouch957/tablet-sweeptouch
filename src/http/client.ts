import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
import Cookies from "js-cookie";

export const api=axios.create({
  baseURL: API_URL, 
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
    validateStatus: (status) => {
        return status >= 200 && status < 300; // default
    },
});


api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
