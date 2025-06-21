// services/authService.ts

import { api } from "@/http/client";
import Cookies from "js-cookie";
export const login = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  const token = res.data.token;
  Cookies.set("auth_token", token);
  return res.data;
};
export const loginWithAccessCode = async (accessCode: string) => {
  const res = await api.post("/auth/login", { accessCode });
  const token = res.data.token;
  Cookies.set("auth_token", token);
  return res.data;
};
export const getMe = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

export const logout = () => {
  Cookies.remove("auth_token");

};
