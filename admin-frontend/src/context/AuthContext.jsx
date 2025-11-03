// src/context/AuthContext.js
import { createContext, useState } from "react";
import API from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user")) || null
  );

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    console.log("Login response:", res.data); // TEMP: inspect structure
    // backend returns { token, user } in our design — adapt if different
    const token = res.data.token || res.data.accessToken || res.data.data?.token;
    const userData = res.data.user || res.data.admin || res.data.data?.user;

    if (!token) throw new Error("No token returned from server");

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    return { token, userData };
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
