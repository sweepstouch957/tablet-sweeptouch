import axios from "axios";
import Cookies from "js-cookie";
import { api as kioskApi } from "./client";

// Same backend and timeout as the kiosk, with the MMS client's session contract.
export const api = axios.create({
  baseURL: kioskApi.defaults.baseURL,
  timeout: kioskApi.defaults.timeout,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "x-app-id": "panel",
  },
});

api.interceptors.request.use((config) => {
  // Keep the kiosk login; support the supplied client's token as a fallback.
  let token = Cookies.get("auth_token");
  if (!token && typeof window !== "undefined") {
    try {
      token = window.localStorage.getItem("uifort-authentication") || undefined;
    } catch {
      // Session cookies can still authenticate when local storage is unavailable.
    }
  }
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
