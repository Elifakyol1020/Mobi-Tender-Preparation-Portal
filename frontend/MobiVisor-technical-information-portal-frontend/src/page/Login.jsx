import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Header from "../component/Header";
import "../css/Home.css";
import { clearSession, storeAuthTokens } from "../api/authClient";
import { useAuth } from "../context/AuthContext";
import { homeTranslations } from "../constants/i18n";
import { login, register } from "../services/authService";

function Login() {
  const [lang, setLang] = useState("EN");
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { loadUserFromToken, setUser } = useAuth();
  const navigate = useNavigate();
  const t = homeTranslations[lang];

  useEffect(() => {
    let active = true;
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      loadUserFromToken()
        .then(() => {
          if (active) redirectByRole(accessToken);
        })
        .catch(() => clearSession());
    }
    return () => {
      active = false;
    };
  }, [loadUserFromToken]);

  const redirectByRole = (accessToken) => {
    const payload = jwtDecode(accessToken);
    if (payload.role === "ROLE_ADMIN") navigate("/admin");
    else if (payload.role === "ROLE_USER") navigate("/user/search");
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

    const payload = mode === "login"
      ? { email: form.email, password: form.password }
      : { email: form.email, username: form.username, password: form.password };

    try {
      const response = await (mode === "login" ? login(payload) : register(payload));
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
    <div className="home-container login-page">
      <Header
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === "EN" ? "TR" : "EN"))}
        actionLabel={t.home}
        onAction={() => navigate("/")}
      />

      <main className="login-shell">
        <section className="auth-panel">
          <h2>{mode === "login" ? t.login : t.register}</h2>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-tabs" role="tablist">
              <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
                {t.login}
              </button>
              <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
                {t.register}
              </button>
            </div>

            <label>
              <span>{t.email}</span>
              <input name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" required />
            </label>

            {mode === "register" && (
              <label>
                <span>{t.username}</span>
                <input name="username" value={form.username} onChange={handleChange} autoComplete="username" required />
              </label>
            )}

            <label>
              <span>{t.password}</span>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={6}
                required
              />
            </label>

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
        </section>
      </main>
    </div>
  );
}

export default Login;
