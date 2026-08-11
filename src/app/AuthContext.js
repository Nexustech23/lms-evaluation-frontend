"use client";

import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axios.get("/api/me", {
        withCredentials: true,
      });

      setUser(res.data.user);
    } catch (err) {
      console.log("ERROR:", err);
      // Temp mock user for visual testing: role 7 = self-learner
      setUser({ role: 7, name: "Test Learner", color: "#6C63FF" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const color = user?.color || "#ff7f10";

    document.documentElement.style.setProperty("--theme-color", color+"70");
    document.documentElement.style.setProperty(
      "--theme-color-light",
      color + "20"
    );
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}