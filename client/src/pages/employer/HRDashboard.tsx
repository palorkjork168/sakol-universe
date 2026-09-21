import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import DepartmentManager from "../../components/employer/DepartmentManager";
import PositionManager from "../../components/employer/PositionManager";
import LeaveTypeManager from "../../components/employer/LeaveTypeManager";
import { Loader2, Building, Briefcase, Calendar } from "lucide-react";

export default function HRDashboard() {
  const [activeTab, setActiveTab] = useState<"departments" | "positions" | "leaveTypes">("departments");

  const companiesQuery = useQuery({
    queryKey: ["myCompanies"],
    queryFn: async () => {
      const res = await api.get("/companies/my");
      return res.data.data.companies;
    },
  });

  const companies = companiesQuery.data || [];
  const primaryCompany = companies[0]; // For MVP, assume they are managing their primary company

  if (companiesQuery.isLoading) {
    return (
      <div className="dashboard-container" style={{ textAlign: "center", padding: "4rem 1.5rem" }}>
        <Loader2 className="animate-spin" size={24} style={{ color: "var(--primary)" }} />
        <div style={{ marginTop: "0.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Loading HR Dashboard...
        </div>
      </div>
    );
  }

  if (!primaryCompany) {
    return (
      <div className="dashboard-container">
        <h2>HR Management</h2>
        <p>You need to create a company profile before managing HR data.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="dashboard-title">Human Resources</h1>
        <p className="dashboard-subtitle">Manage departments, positions, and leave policies for {primaryCompany.name}.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid var(--border)" }}>
        <button
          onClick={() => setActiveTab("departments")}
          style={{
            padding: "0.75rem 1rem",
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "departments" ? "2px solid var(--primary)" : "2px solid transparent",
            color: activeTab === "departments" ? "var(--primary)" : "var(--text-muted)",
            fontWeight: activeTab === "departments" ? 600 : 400,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Building size={18} /> Departments
        </button>
        <button
          onClick={() => setActiveTab("positions")}
          style={{
            padding: "0.75rem 1rem",
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "positions" ? "2px solid var(--primary)" : "2px solid transparent",
            color: activeTab === "positions" ? "var(--primary)" : "var(--text-muted)",
            fontWeight: activeTab === "positions" ? 600 : 400,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Briefcase size={18} /> Positions
        </button>
        <button
          onClick={() => setActiveTab("leaveTypes")}
          style={{
            padding: "0.75rem 1rem",
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "leaveTypes" ? "2px solid var(--primary)" : "2px solid transparent",
            color: activeTab === "leaveTypes" ? "var(--primary)" : "var(--text-muted)",
            fontWeight: activeTab === "leaveTypes" ? 600 : 400,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Calendar size={18} /> Leave Types
        </button>
      </div>

      <div className="card" style={{ padding: "2rem" }}>
        {activeTab === "departments" && <DepartmentManager companyId={primaryCompany.id} />}
        {activeTab === "positions" && <PositionManager companyId={primaryCompany.id} />}
        {activeTab === "leaveTypes" && <LeaveTypeManager companyId={primaryCompany.id} />}
      </div>
    </div>
  );
}
