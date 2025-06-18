import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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