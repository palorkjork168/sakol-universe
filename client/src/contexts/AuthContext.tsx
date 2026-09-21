import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import api from "../services/api";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: (string | { name: string })[];
  department?: string | null;
  avatar_url?: string | null;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user?: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isEmployee: boolean;
  isJobSeeker: boolean;
  isEmployer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await api.get("/auth/me");
      const fetchedUser = response.data?.data?.user;
      if (fetchedUser) {
        setUser(fetchedUser);
        localStorage.setItem("user", JSON.stringify(fetchedUser));
      }
    } catch (error: any) {
      console.error("Failed to fetch user:", error);
      // Only logout if unauthorized (401) or forbidden (403)
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = (newToken: string, userData?: User) => {
    localStorage.setItem("token", newToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    setToken(newToken);
    if (userData) {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setIsLoading(false);
    } else {
      fetchUser();
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
    setIsLoading(false);
  };

  const hasRole = (roleName: string) => {
    if (!user?.roles) return false;
    return user.roles.some((r: any) => {
      if (typeof r === "string") return r === roleName;
      if (r && typeof r === "object" && r.name) return r.name === roleName;
      return false;
    });
  };

  const isAdmin = hasRole("ADMIN");
  const isEmployee = hasRole("EMPLOYEE");
  const isJobSeeker = hasRole("JOB_SEEKER");
  const isEmployer = hasRole("EMPLOYER");

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        refreshUser: fetchUser,
        isAdmin,
        isEmployee,
        isJobSeeker,
        isEmployer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
