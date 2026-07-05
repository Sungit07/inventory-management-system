import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: "ADMIN" | "MANAGER" | "OPERATOR";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (role: "ADMIN" | "MANAGER" | "OPERATOR") => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("ims_token");
    const storedUser = localStorage.getItem("ims_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (role: "ADMIN" | "MANAGER" | "OPERATOR") => {
    let mockUser: User;
    let mockToken = "";

    if (role === "ADMIN") {
      mockUser = { id: "usr_admin", email: "admin@enterprise.com", displayName: "Admin User", role: "ADMIN" };
      mockToken = "admin-token";
    } else if (role === "MANAGER") {
      mockUser = { id: "usr_manager", email: "manager@enterprise.com", displayName: "Manager User", role: "MANAGER" };
      mockToken = "manager-token";
    } else {
      mockUser = { id: "usr_operator", email: "operator@enterprise.com", displayName: "Operator User", role: "OPERATOR" };
      mockToken = "operator-token";
    }

    setToken(mockToken);
    setUser(mockUser);
    localStorage.setItem("ims_token", mockToken);
    localStorage.setItem("ims_user", JSON.stringify(mockUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("ims_token");
    localStorage.removeItem("ims_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
