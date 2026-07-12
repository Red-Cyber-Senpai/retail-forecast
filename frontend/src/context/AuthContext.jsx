import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { getCurrentUser } from "../services/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  async function initializeAuth() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const me = await getCurrentUser();

      setUser(me);
    } catch (err) {
      console.error(err);

      localStorage.removeItem("accessToken");

      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(token) {
    try {
      localStorage.setItem(
        "accessToken",
        token
      );

      const me =
        await getCurrentUser();

      setUser(me);
    } catch (err) {
      console.error(err);

      localStorage.removeItem(
        "accessToken"
      );

      setUser(null);

      throw err;
    }
  }

  function logout() {
    localStorage.removeItem(
      "accessToken"
    );

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}