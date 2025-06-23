import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import api from "../services/api";

type User = {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  isAdmin: boolean;
};

type AuthContextData = {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (token: string, userData: User) => void;
  logout: () => void;
  authenticated: boolean;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [authenticated, setAuthenticated] = useState(() => {
    return !!localStorage.getItem("token");
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setAuthenticated(true);
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    api.defaults.headers.Authorization = `Bearer ${token}`;
    setUser(userData);
    setAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Corrija a linha abaixo para usar null ou delete
    delete api.defaults.headers.Authorization;
    setUser(null);
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, logout, authenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
