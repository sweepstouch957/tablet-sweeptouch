// auth-context.tsx
import React, { createContext, useContext, useState } from "react";
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
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string) => setUser({
    _id: "1",
    firstName: "John",
    lastName: "Doe",
    email,
    phoneNumber: "123-456-7890",
    role: "user",
    store: {
      _id: "store1",
      name: "Example Store"
    }
  }); // Simulate login, replace with actual logic
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
