/* eslint-disable @typescript-eslint/no-explicit-any */
// auth-context.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  login as apiLogin,
  logout as apiLogout,
  getMe,
  loginWithAccessCode,
} from "@/services/auth.service";
import Cookies from "js-cookie";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  store?: {
    _id: string;
    name: string;
  };
}

interface AuthContextType {
  user: User | null;
  error: string | null;
  login: (
    email: string,
    password: string,
    accessCode?: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = async (
    email?: string,
    password?: string,
    accessCode?: string
  ) => {
    try {
      let data;

      if (accessCode) {
        // Login con código de acceso (solo para cajeros)
        data = await loginWithAccessCode(accessCode);
      } else {
        // Validación básica para login tradicional
        if (!email || !password) {
          throw new Error("Debes ingresar un correo y una contraseña.");
        }

        data = await apiLogin(email, password);
      }

      setUser(data.user);
      setError(null);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error.message ||
        "Error al iniciar sesión.";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  useEffect(() => {
    const token = Cookies.get("auth_token");
    if (token) {
      getMe()
        .then(setUser)
        .catch(() => Cookies.remove("auth_token"));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
