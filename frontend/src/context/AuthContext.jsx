import { createContext, useContext, useEffect, useState } from "react";
import { login as loginApi, register as registerApi } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("smartshelf_token"));

  useEffect(() => {
    const rawUser = localStorage.getItem("smartshelf_user");
    if (rawUser) {
      setUser(JSON.parse(rawUser));
    }
  }, []);

  const persistSession = (payload) => {
    const nextUser = {
      userId: payload.userId,
      fullName: payload.fullName,
      email: payload.email
    };

    setToken(payload.token);
    setUser(nextUser);
    localStorage.setItem("smartshelf_token", payload.token);
    localStorage.setItem("smartshelf_user", JSON.stringify(nextUser));
  };

  const login = async (payload) => {
    const response = await loginApi(payload);
    persistSession(response);
    return response;
  };

  const register = async (payload) => {
    const response = await registerApi(payload);
    persistSession(response);
    return response;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("smartshelf_token");
    localStorage.removeItem("smartshelf_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

