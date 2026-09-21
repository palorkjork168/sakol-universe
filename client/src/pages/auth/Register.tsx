import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { Briefcase, Loader2, Lock, Mail, Phone, User } from "lucide-react";

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirect = searchParams.get("redirect") || "";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (firstName.trim().length < 2) {
      setError("First name must be at least 2 characters.");
      return;
    }
    if (lastName.trim().length < 2) {
      setError("Last name must be at least 2 characters.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const payload: {
        first_name: string;
        last_name: string;
        email: string;
        password: string;
        phone?: string;
      } = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
      };

      if (phone.trim()) {
        payload.phone = phone.trim();
      }

      await api.post("/auth/register", payload);

      // Redirect to login preserving destination
      const loginUrl = redirect
        ? `/login?redirect=${encodeURIComponent(redirect)}&registered=true`
        : "/login?registered=true";

      navigate(loginUrl);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "460px",
        margin: "60px auto",
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
        <h2 style={{ fontSize: "1.5rem", margin: "0 0 0.5rem 0" }}>Create an Account</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>
          Join Sakol Universe to apply for jobs and connect with top employers.
        </p>
      </div>

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
        <div className="form-grid two-cols" style={{ gap: "1rem" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">
              First Name <span className="required">*</span>
            </label>
            <div className="search-field-wrapper" style={{ backgroundColor: "#ffffff", border: "1px solid var(--border-color)" }}>
              <User size={16} style={{ color: "var(--text-light)" }} />
              <input
                type="text"
                className="search-field-input"
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">
              Last Name <span className="required">*</span>
            </label>
            <div className="search-field-wrapper" style={{ backgroundColor: "#ffffff", border: "1px solid var(--border-color)" }}>
              <User size={16} style={{ color: "var(--text-light)" }} />
              <input
                type="text"
                className="search-field-input"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">
            Email Address <span className="required">*</span>
          </label>
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
          <label className="form-label">
            Password <span className="required">*</span>
          </label>
          <div className="search-field-wrapper" style={{ backgroundColor: "#ffffff", border: "1px solid var(--border-color)" }}>
            <Lock size={16} style={{ color: "var(--text-light)" }} />
            <input
              type="password"
              className="search-field-input"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Phone Number (Optional)</label>
          <div className="search-field-wrapper" style={{ backgroundColor: "#ffffff", border: "1px solid var(--border-color)" }}>
            <Phone size={16} style={{ color: "var(--text-light)" }} />
            <input
              type="tel"
              className="search-field-input"
              placeholder="012 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
              <Loader2 size={18} className="spinner" /> Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "1.75rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
        Already have an account?{" "}
        <Link
          to={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"}
          style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
