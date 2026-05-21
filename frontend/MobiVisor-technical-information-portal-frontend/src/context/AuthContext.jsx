import { jwtDecode } from "jwt-decode";
import { createContext, useState, useEffect, useContext } from "react";
import { clearSession } from "../api/authClient";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const loadUserFromToken = async () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);

        if (decoded.roles) {
          localStorage.setItem("roles", JSON.stringify(decoded.roles));
          localStorage.setItem("role", decoded.roles[0]);
        } else if (decoded.role) {
          localStorage.setItem("role", decoded.role);
        }
      } catch (e) {
        console.error("Invalid token", e);
        setUser(null);
        clearSession();
      }
    } else {
      setUser(null);
      clearSession();
    }
    setLoading(false);
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  useEffect(() => {
    loadUserFromToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser, loadUserFromToken, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
