import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { Briefcase, Loader2, Lock, Mail, CheckCircle2 } from "lucide-react";

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const redirect = searchParams.get("redirect");
  const isRegistered = searchParams.get("registered") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isSafeRedirect = (url: string | null): boolean => {
    if (!url) return false;
    return url.startsWith("/") && !url.startsWith("//");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const token = response.data?.data?.token;
      const user = response.data?.data?.user;

      if (!token || !user) {
        throw new Error("Invalid response format from server");
      }

      login(token, user);

      // Safe return redirection
      if (isSafeRedirect(redirect)) {
        navigate(redirect!);
        return;
      }

      // Default role-based redirection
      const roles = user.roles || [];
      const hasRole = (roleName: string) =>
        roles.some((r: any) => (typeof r === "string" ? r === roleName : r?.name === roleName));

      if (hasRole("ADMIN")) {
        navigate("/admin/dashboard");
      } else if (hasRole("EMPLOYER")) {
        navigate("/employer/dashboard");
      } else if (hasRole("EMPLOYEE")) {
        navigate("/employee/dashboard");
      } else if (hasRole("JOB_SEEKER")) {
        navigate("/job-seeker/dashboard");
      } else {
        navigate("/jobs");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "420px",
        margin: "70px auto",
        padding: "2.5rem",
        backgroundColor: "#ffffff",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <Link to="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <div className="brand-icon" style={{ width: "36px", height: "36px" }}>
            <Briefcase size={18} />
          </div>
          <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)" }}>Sakol Universe</span>
        </Link>
        <h2 style={{ fontSize: "1.5rem", margin: "0 0 0.5rem 0" }}>Welcome Back</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>
          Sign in to your account to continue
        </p>
      </div>

      {isRegistered && (
        <div
          style={{
            padding: "0.75rem 1rem",
            marginBottom: "1.5rem",
            backgroundColor: "var(--success-bg)",
            color: "var(--success-text)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.875rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <CheckCircle2 size={16} /> Account created successfully! Please sign in below.
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "0.75rem 1rem",
            marginBottom: "1.5rem",
            backgroundColor: "var(--danger-bg)",
            color: "var(--danger)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Email Address</label>
          <div className="search-field-wrapper" style={{ backgroundColor: "#ffffff", border: "1px solid var(--border-color)" }}>
            <Mail size={16} style={{ color: "var(--text-light)" }} />
            <input
              type="email"
              className="search-field-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Password</label>
          <div className="search-field-wrapper" style={{ backgroundColor: "#ffffff", border: "1px solid var(--border-color)" }}>
            <Lock size={16} style={{ color: "var(--text-light)" }} />
            <input
              type="password"
              className="search-field-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary"
          style={{ width: "100%", padding: "0.75rem", fontSize: "1rem", marginTop: "0.5rem" }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="spinner" /> Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "1.75rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
        Don't have an account?{" "}
        <Link
          to={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : "/register"}
          style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}
        >
          Register
        </Link>
      </div>
    </div>
  );
}
