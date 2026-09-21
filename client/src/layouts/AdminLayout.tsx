import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Briefcase, LayoutDashboard, Users, LogOut, Menu, X } from "lucide-react";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Employees", path: "/admin/employees", icon: Users },
  ];

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const getInitials = (first?: string, last?: string) => {
    if (!first) return "AD";
    return `${first.charAt(0)}${last ? last.charAt(0) : ""}`.toUpperCase();
  };

  return (
    <div className="public-layout">
      {/* Top Navigation */}
      <header className="public-navbar">
        <div className="navbar-container">
          {/* Brand */}
          <Link to="/admin/dashboard" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
            <div className="brand-icon">
              <Briefcase size={20} />
            </div>
            <div className="brand-text">
              <span className="brand-title">Sakol Universe</span>
              <span className="brand-subtitle">Admin Portal</span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <ul className={`nav-links ${mobileMenuOpen ? "open" : ""}`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive(item.path) ? "active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* User Section */}
          <div className="nav-actions">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  backgroundColor: "var(--primary-bg)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  border: "1px solid rgba(37, 99, 235, 0.2)",
                }}
              >
                {getInitials(user?.first_name, user?.last_name)}
              </div>
              <button onClick={logout} className="btn btn-ghost" title="Logout" style={{ padding: "0.5rem" }}>
                <LogOut size={16} />
              </button>
            </div>

            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="public-main">
        <Outlet />
      </main>
    </div>
  );
}
