import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Header from "../component/Header";
import "../css/Home.css";
import { clearSession, storeAuthTokens } from "../api/authClient";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const TEXTS = {
  EN: {
    title: "Welcome to the centralized data access system.",
    subtitle: "Log in or create an account to start your inquiry.",
    login: "Login",
    register: "Register",
    email: "Email",
    username: "Username",
    password: "Password",
    submitLogin: "Login",
    submitRegister: "Create account",
    switchToRegister: "Need an account?",
    switchToLogin: "Already have an account?",
    error: "Authentication failed"
  },
  TR: {
    title: "Merkezi veri erişim sistemine hoş geldiniz.",
    subtitle: "Sorgulamanıza başlamak için giriş yapın veya kayıt olun.",
    login: "Giriş",
    register: "Kayıt",
    email: "E-posta",
    username: "Kullanıcı adı",
    password: "Şifre",
    submitLogin: "Giriş yap",
    submitRegister: "Hesap oluştur",
    switchToRegister: "Hesabınız yok mu?",
    switchToLogin: "Zaten hesabınız var mı?",
    error: "Kimlik doğrulama başarısız"
  }
};

function Home() {
  const [lang, setLang] = useState("EN");
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { loadUserFromToken, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      loadUserFromToken()
        .then(() => {
          if (active) redirectByRole(accessToken);
        })
        .catch(() => {
          clearSession();
        });
    }
    return () => {
      active = false;
    };
  }, [navigate, loadUserFromToken]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const handleLangToggle = () => {
    setLang((prev) => (prev === "EN" ? "TR" : "EN"));
  };

  const t = TEXTS[lang];

  const redirectByRole = (accessToken) => {
    const payload = jwtDecode(accessToken);
    const role = payload.role;
    if (role === "ROLE_ADMIN") navigate("/admin");
    else if (role === "ROLE_USER") navigate("/user/search");
    else navigate("/");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const endpoint = mode === "login" ? "login" : "register";
    const payload = mode === "login"
      ? { email: form.email, password: form.password }
      : { email: form.email, username: form.username, password: form.password };

    try {
      const response = await axios.post(`${API_URL}/api/v1/auth/${endpoint}`, payload, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" }
      });

      const data = response.data;
      storeAuthTokens(data);
      const decoded = jwtDecode(data.accessToken);
      setUser(decoded);
      redirectByRole(data.accessToken);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data || err.message;
      setError(message || t.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="home-container"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
        position: "relative",
      }}
    >
      <Header />

      {/* EN/TR yuvarlak toggle butonu */}
      <button
        onClick={handleLangToggle}
        className="lang-toggle-btn"
        aria-label="Dil değiştir"
      >
        {lang}
      </button>

      <div className="home-text">
        <h1>{t.title}</h1>
        <h2>{t.subtitle}</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              {t.login}
            </button>
            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => {
                setMode("register");
                setError("");
              }}
            >
              {t.register}
            </button>
          </div>

          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder={t.email}
            autoComplete="email"
            required
          />

          {mode === "register" && (
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder={t.username}
              autoComplete="username"
              required
            />
          )}

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder={t.password}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={6}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button className="home-button" type="submit" disabled={submitting}>
            {mode === "login" ? t.submitLogin : t.submitRegister}
          </button>

          <button
            className="auth-switch"
            type="button"
            onClick={() => {
              setMode((prev) => (prev === "login" ? "register" : "login"));
              setError("");
            }}
          >
            {mode === "login" ? t.switchToRegister : t.switchToLogin}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Home;
