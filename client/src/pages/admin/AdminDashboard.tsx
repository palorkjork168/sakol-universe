import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { Users, Building2, Briefcase, FileText, UserCheck, Calendar, Loader2, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const res = await api.get("/admin/dashboard");
      return res.data.data;
    },
  });

  if (isLoading) {
    return <div className="dashboard-container" style={{ textAlign: "center", padding: "4rem" }}><Loader2 className="animate-spin" /></div>;
  }

  if (isError) {
    return (
      <div className="dashboard-container empty-state">
        <div className="empty-state-icon" style={{ backgroundColor: "var(--danger-bg)", color: "var(--danger)" }}>
          <AlertCircle size={32} />
        </div>
        <h3 style={{ margin: "0 0 0.5rem 0" }}>Unable to load dashboard</h3>
        <p style={{ color: "var(--text-muted)", margin: "0 0 1.5rem 0" }}>We couldn't retrieve the operational metrics.</p>
        <button onClick={() => refetch()} className="btn btn-secondary">Try Again</button>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats?.users, icon: Users, color: "blue" },
    { label: "Companies", value: stats?.companies, icon: Building2, color: "emerald" },
    { label: "Published Jobs", value: stats?.active_jobs, icon: Briefcase, color: "purple" },
    { label: "Applications", value: stats?.applications, icon: FileText, color: "orange" },
    { label: "Active Employees", value: stats?.employees, icon: UserCheck, color: "indigo" },
    { label: "Pending Leave Req.", value: stats?.pending_leaves, icon: Calendar, color: "rose" },
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">Overview of platform activity and workforce operations.</p>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {statCards.map((card, index) => (
          <div key={index} className="card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: `var(--${card.color}-100, #eff6ff)`,
              color: `var(--${card.color}-600, #2563eb)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <card.icon size={24} />
            </div>
            <div>
              <p style={{ margin: "0 0 0.25rem 0", color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 500 }}>
                {card.label}
              </p>
              <h2 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, color: "var(--text-main)" }}>
                {card.value?.toLocaleString() || "0"}
              </h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
