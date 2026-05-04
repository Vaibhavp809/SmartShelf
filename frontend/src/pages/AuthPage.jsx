import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function friendlyValidationMessages(errors) {
  if (!errors) {
    return [];
  }

  const messages = [];

  if (errors.fullName) {
    messages.push("Enter your name. It should be at least 3 characters long.");
  }

  if (errors.email) {
    messages.push("Enter a proper email address, like name@example.com.");
  }

  if (errors.password) {
    messages.push("Password should be at least 6 characters long.");
  }

  return messages;
}

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setValidationErrors([]);
    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
      navigate(location.state?.from || "/dashboard");
    } catch (requestError) {
      const apiErrors = requestError.response?.data?.errors;
      const structuredMessages = friendlyValidationMessages(apiErrors);

      if (structuredMessages.length > 0) {
        setValidationErrors(structuredMessages);
        setError("");
        return;
      }

      setError(requestError.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <main className="page auth-page">
      <section className="auth-layout glass-panel">
        <div className="auth-copy">
          <span className="eyebrow">Welcome Back</span>
          <h1>Build your next reading obsession</h1>
          <p>Save titles, rate what you read, and unlock personalized recommendations with every shelf update.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="tab-row">
            <button type="button" className={mode === "login" ? "tab active" : "tab"} onClick={() => setMode("login")}>Login</button>
            <button type="button" className={mode === "register" ? "tab active" : "tab"} onClick={() => setMode("register")}>Register</button>
          </div>

          {mode === "register" && (
            <input
              placeholder="Full name"
              value={form.fullName}
              onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            />
          )}

          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
          {validationErrors.length > 0 && (
            <div className="validation-box">
              <strong>Please fix the following:</strong>
              <ul className="validation-list">
                {validationErrors.map((message) => <li key={message}>{message}</li>)}
              </ul>
            </div>
          )}
          {error && <p className="error-text">{error}</p>}
          <button className="primary-button" type="submit">{mode === "login" ? "Sign In" : "Create Account"}</button>
        </form>
      </section>
    </main>
  );
}
