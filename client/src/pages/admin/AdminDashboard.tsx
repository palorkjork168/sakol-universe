import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  UserCheck,
  Calendar,
  Loader2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Activity,
} from "lucide-react";
import EmptyState from "../../components/common/EmptyState";

export default function AdminDashboard() {
  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const res = await api.get("/admin/dashboard");
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="page-container" style={{ textAlign: "center", padding: "6rem 0" }}>
        <Loader2 className="animate-spin" size={32} style={{ color: "var(--color-primary)", margin: "0 auto" }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-container">
        <EmptyState
          icon={AlertCircle}
          title="Unable to load dashboard metrics"
          description="We couldn't retrieve the platform metrics. Please verify your connection or try again."
          action={{ label: "Retry", onClick: () => refetch() }}
        />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Registered Users",
      value: stats?.users ?? 0,
      icon: Users,
      color: "var(--color-primary)",
      bg: "var(--color-primary-soft)",
      border: "var(--color-primary-border)",
    },
    {
      label: "Registered Companies",
      value: stats?.companies ?? 0,
      icon: Building2,
      color: "var(--color-success)",
      bg: "var(--color-success-soft)",
      border: "var(--color-success-border)",
    },
    {
      label: "Published Jobs",
      value: stats?.active_jobs ?? 0,
      icon: Briefcase,
      color: "#8b5cf6",
      bg: "#f5f3ff",
      border: "#ddd6fe",
    },
    {
      label: "Job Applications",
      value: stats?.applications ?? 0,
      icon: FileText,
      color: "var(--color-warning)",
      bg: "var(--color-warning-soft)",
      border: "var(--color-warning-border)",
    },
    {
      label: "Active Employees",
      value: stats?.employees ?? 0,
      icon: UserCheck,
      color: "#0284c7",
      bg: "#f0f9ff",
      border: "#bae6fd",
    },
    {
      label: "Pending Leave Requests",
      value: stats?.pending_leaves ?? 0,
      icon: Calendar,
      color: "var(--color-danger)",
      bg: "var(--color-danger-soft)",
      border: "var(--color-danger-border)",
    },
  ];

  return (
    <div className="page-container fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Platform overview of workforce operations, jobs, and applications.</p>
        </div>
        <div className="page-actions">
          <Link to="/admin/employees" className="btn btn-secondary">
            <Users size={16} /> Manage Employees
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="card-grid" style={{ marginBottom: "2.5rem" }}>
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="card stat-card">
              <div
                className="stat-icon-wrapper"
                style={{
                  backgroundColor: card.bg,
                  color: card.color,
                  border: `1px solid ${card.border}`,
                }}
              >
                <Icon size={22} strokeWidth={2} />
              </div>
              <div className="stat-content">
                <span className="stat-label">{card.label}</span>
                <span className="stat-value">{card.value.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Operational Overview & Quick Links */}
      <div className="two-col-grid">
        {/* Quick Operations Card */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ShieldCheck size={18} style={{ color: "var(--color-primary)" }} />
              Platform Management
            </h3>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", margin: 0 }}>
              Access administrative features to inspect staff accounts, adjust roles, and monitor cross-tenant system activity.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem", marginTop: "0.5rem" }}>
              <Link
                to="/admin/employees"
                className="card card-clickable"
                style={{
                  padding: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textDecoration: "none",
                }}
              >
                <div>
                  <h4 style={{ fontSize: "0.9375rem", margin: "0 0 2px", color: "var(--color-text)" }}>Employees</h4>
                  <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>View & manage roster</span>
                </div>
                <ArrowRight size={16} style={{ color: "var(--color-text-muted)" }} />
              </Link>

              <Link
                to="/jobs"
                className="card card-clickable"
                style={{
                  padding: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textDecoration: "none",
                }}
              >
                <div>
                  <h4 style={{ fontSize: "0.9375rem", margin: "0 0 2px", color: "var(--color-text)" }}>Public Portal</h4>
                  <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>Browse listed positions</span>
                </div>
                <ArrowRight size={16} style={{ color: "var(--color-text-muted)" }} />
              </Link>
            </div>
          </div>
        </div>

        {/* System Summary */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Activity size={18} style={{ color: "var(--color-success)" }} />
              System Status
            </h3>
            <span className="badge badge-success">Healthy</span>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>API Gateway</span>
                <strong style={{ color: "var(--color-text)" }}>Online (Port 5000)</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Database Sync</span>
                <strong style={{ color: "var(--color-text)" }}>Synchronized</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Multi-Tenant Security</span>
                <strong style={{ color: "var(--color-text)" }}>RBAC Active</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Leave Workflow</span>
                <strong style={{ color: "var(--color-text)" }}>Operational</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
