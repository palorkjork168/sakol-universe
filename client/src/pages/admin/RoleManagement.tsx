import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import { useToast } from "../../contexts/ToastContext";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  Briefcase,
  Building2,
  Check,
  X,
  Lock,
  Layers,
  Sparkles,
  Calendar,
  Clock,
  Settings,
} from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface RoleData {
  id: string;
  name: string;
  description: string;
  is_system_core: boolean;
  is_company_role: boolean;
  permission_count: number;
  user_count: number;
  company_assignment_count: number;
  permissions: { id: string; name: string; category: string }[];
}

const CATEGORY_META: Record<string, { label: string; icon: any; color: string }> = {
  company: { label: "Company & Organization", icon: Building2, color: "#2563eb" },
  jobs: { label: "Jobs & Postings", icon: Briefcase, color: "#059669" },
  applicants: { label: "Candidates & Applications", icon: Users, color: "#d97706" },
  interviews: { label: "Interviews", icon: Calendar, color: "#7c3aed" },
  employees: { label: "Workforce & Employees", icon: Users, color: "#0891b2" },
  attendance: { label: "Attendance Tracking", icon: Clock, color: "#ea580c" },
  leave: { label: "Leave Management", icon: Calendar, color: "#4f46e5" },
  departments: { label: "Departments", icon: Building2, color: "#0284c7" },
  positions: { label: "Positions & Titles", icon: Layers, color: "#6366f1" },
  admin: { label: "System Administration", icon: Settings, color: "#dc2626" },
};

const PERMISSION_FRIENDLY_NAMES: Record<string, string> = {
  "company.view": "View Company Profile",
  "company.update": "Update Company Details",
  "jobs.view": "Browse Job Listings",
  "jobs.create": "Create Job Postings",
  "jobs.update": "Edit Job Postings",
  "jobs.close": "Close & Delist Jobs",
  "applicants.view": "View Applications & Resumes",
  "applicants.update_status": "Advance Application Pipeline",
  "interviews.view": "View Scheduled Interviews",
  "interviews.schedule": "Schedule Candidate Interviews",
  "interviews.update": "Reschedule & Edit Interviews",
  "interviews.cancel": "Cancel Interviews",
  "employees.view": "View Employee Profiles",
  "employees.manage": "Manage Employee Records",
  "attendance.view_own": "View Own Attendance",
  "attendance.manage": "Manage Workforce Attendance",
  "leave.request": "Submit Leave Requests",
  "leave.view_own": "View Own Leave Balance",
  "leave.review": "Review & Approve Leave",
  "leave.policy_manage": "Manage Leave Types & Policies",
  "departments.manage": "Manage Departments",
  "positions.manage": "Manage Job Positions",
  "users.manage": "Global User Management",
  "roles.manage": "Governance & Role Configuration",
};

export default function RoleManagement() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);

  const [editedPermissions, setEditedPermissions] = useState<string[]>([]);

  // Fetch all roles
  const { data: rolesData, isLoading: rolesLoading, error: rolesError } = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: async () => {
      const res = await api.get("/admin/roles");
      return res.data.data.roles as RoleData[];
    },
  });

  // Fetch all permissions grouped
  const { data: permsData, isLoading: permsLoading } = useQuery({
    queryKey: ["admin", "permissions"],
    queryFn: async () => {
      const res = await api.get("/admin/permissions");
      return res.data.data as { permissions: Permission[]; grouped: Record<string, Permission[]> };
    },
  });

  // Mutation to update permissions
  const updateMutation = useMutation({
    mutationFn: async ({ roleId, permissionNames }: { roleId: string; permissionNames: string[] }) => {
      const res = await api.put(`/admin/roles/${roleId}/permissions`, {
        permission_names: permissionNames,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Role permissions updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
      setSelectedRole(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update role permissions");
    },
  });

  const handleOpenEditor = (role: RoleData) => {
    setSelectedRole(role);
    setEditedPermissions(role.permissions ? role.permissions.map((p) => p.name) : []);
  };

  const handleTogglePermission = (permName: string) => {
    if (selectedRole?.name === "ADMIN" && (permName === "roles.manage" || permName === "users.manage")) {
      toast.info("Critical administrator permissions cannot be removed from ADMIN.");
      return;
    }

    setEditedPermissions((prev) =>
      prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName]
    );
  };

  const handleSave = () => {
    if (!selectedRole) return;
    updateMutation.mutate({
      roleId: selectedRole.id,
      permissionNames: editedPermissions,
    });
  };

  const stats = useMemo(() => {
    if (!rolesData) return { totalRoles: 0, coreRoles: 0, companyRoles: 0, totalPerms: 0 };
    const core = rolesData.filter((r) => r.is_system_core).length;
    const company = rolesData.filter((r) => r.is_company_role).length;
    const perms = permsData?.permissions.length || 0;
    return {
      totalRoles: rolesData.length,
      coreRoles: core,
      companyRoles: company,
      totalPerms: perms,
    };
  }, [rolesData, permsData]);

  return (
    <div style={{ padding: "2rem", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: "rgba(37, 99, 235, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-primary)",
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text)", margin: 0 }}>
              Roles & Permissions Governance
            </h1>
            <p style={{ color: "var(--color-text-secondary)", margin: "0.25rem 0 0 0", fontSize: "0.9375rem" }}>
              Configure domain permissions for global system roles and company-scoped roles.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2rem",
        }}
      >
        <div className="card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "rgba(37, 99, 235, 0.1)",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>
              Total Roles
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text)" }}>
              {rolesLoading ? "..." : stats.totalRoles}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lock size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>
              Core System Roles
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text)" }}>
              {rolesLoading ? "..." : stats.coreRoles}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "rgba(147, 51, 234, 0.1)",
              color: "#7c3aed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>
              Company Roles
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text)" }}>
              {rolesLoading ? "..." : stats.companyRoles}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "rgba(217, 119, 6, 0.1)",
              color: "#d97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>
              Domain Permissions
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text)" }}>
              {permsLoading ? "..." : stats.totalPerms}
            </div>
          </div>
        </div>
      </div>

      {/* Role Grid */}
      {rolesLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" }}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="card" style={{ padding: "1.5rem", height: "180px" }}>
              <div className="skeleton" style={{ width: "60%", height: "24px", marginBottom: "1rem" }} />
              <div className="skeleton" style={{ width: "90%", height: "16px", marginBottom: "0.5rem" }} />
              <div className="skeleton" style={{ width: "40%", height: "16px" }} />
            </div>
          ))}
        </div>
      ) : rolesError ? (
        <div className="card" style={{ padding: "2.5rem", textAlign: "center", color: "var(--color-danger)" }}>
          <ShieldAlert size={40} style={{ margin: "0 auto 1rem" }} />
          <h3>Failed to load roles</h3>
          <p>Please ensure backend server is online.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {rolesData?.map((role) => {
            const isSystem = role.is_system_core;
            return (
              <div
                key={role.id}
                className="card"
                style={{
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  border: selectedRole?.id === role.id ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                  position: "relative",
                  transition: "all 0.2s ease",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          backgroundColor: isSystem ? "rgba(37, 99, 235, 0.1)" : "rgba(147, 51, 234, 0.1)",
                          color: isSystem ? "#2563eb" : "#7c3aed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {role.name === "ADMIN" ? <ShieldCheck size={20} /> : isSystem ? <Lock size={18} /> : <Building2 size={18} />}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text)" }}>
                          {role.name}
                        </h3>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                          {isSystem ? "Global System Role" : "Company-Scoped Role"}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        padding: "0.25rem 0.5rem",
                        borderRadius: "12px",
                        backgroundColor: isSystem ? "rgba(37, 99, 235, 0.1)" : "rgba(147, 51, 234, 0.1)",
                        color: isSystem ? "#2563eb" : "#7c3aed",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {isSystem ? "Core" : "Company"}
                    </span>
                  </div>

                  <p
                    style={{
                      color: "var(--color-text-secondary)",
                      fontSize: "0.875rem",
                      minHeight: "40px",
                      margin: "0 0 1rem 0",
                      lineHeight: "1.4",
                    }}
                  >
                    {role.description || "No description provided."}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "1.25rem",
                      padding: "0.75rem",
                      backgroundColor: "var(--color-surface-muted)",
                      borderRadius: "8px",
                      marginBottom: "1.25rem",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                        Permissions
                      </div>
                      <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text)" }}>
                        {role.permission_count}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                        {isSystem ? "Global Users" : "Assignments"}
                      </div>
                      <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text)" }}>
                        {isSystem ? role.user_count : role.company_assignment_count}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenEditor(role)}
                  className="btn btn-secondary"
                  style={{ width: "100%", justifyContent: "center", gap: "0.5rem" }}
                >
                  <Settings size={16} />
                  <span>Configure Permissions</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Permission Configuration Modal */}
      {selectedRole && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "840px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "var(--color-surface)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, color: "var(--color-text)" }}>
                    Configure Role: {selectedRole.name}
                  </h2>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.5rem",
                      borderRadius: "10px",
                      backgroundColor: selectedRole.is_system_core ? "rgba(37, 99, 235, 0.1)" : "rgba(147, 51, 234, 0.1)",
                      color: selectedRole.is_system_core ? "#2563eb" : "#7c3aed",
                    }}
                  >
                    {editedPermissions.length} Permissions Selected
                  </span>
                </div>
                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                  Toggle fine-grained domain permissions granted to this role.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="btn btn-ghost btn-icon-only"
                style={{ borderRadius: "50%" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body: Grouped Permissions */}
            <div
              style={{
                padding: "1.5rem",
                overflowY: "auto",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {permsData &&
                Object.entries(permsData.grouped).map(([category, perms]) => {
                  const meta = CATEGORY_META[category] || {
                    label: category.toUpperCase(),
                    icon: Shield,
                    color: "#6b7280",
                  };
                  const Icon = meta.icon;

                  return (
                    <div
                      key={category}
                      style={{
                        border: "1px solid var(--color-border)",
                        borderRadius: "10px",
                        overflow: "hidden",
                      }}
                    >
                      {/* Category Header */}
                      <div
                        style={{
                          padding: "0.75rem 1rem",
                          backgroundColor: "var(--color-surface-muted)",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          borderBottom: "1px solid var(--color-border)",
                        }}
                      >
                        <Icon size={16} color={meta.color} />
                        <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-text)" }}>
                          {meta.label}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginLeft: "auto" }}>
                          {perms.filter((p) => editedPermissions.includes(p.name)).length} of {perms.length} enabled
                        </span>
                      </div>

                      {/* Permission Items */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                          gap: "0.5rem",
                          padding: "0.75rem",
                          backgroundColor: "var(--color-surface)",
                        }}
                      >
                        {perms.map((perm) => {
                          const isChecked = editedPermissions.includes(perm.name);
                          const isLocked =
                            selectedRole.name === "ADMIN" &&
                            (perm.name === "roles.manage" || perm.name === "users.manage");
                          const friendlyTitle = PERMISSION_FRIENDLY_NAMES[perm.name] || perm.name;

                          return (
                            <label
                              key={perm.id}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "0.75rem",
                                padding: "0.625rem 0.75rem",
                                borderRadius: "8px",
                                border: isChecked ? "1px solid rgba(37, 99, 235, 0.3)" : "1px solid var(--color-border)",
                                backgroundColor: isChecked ? "rgba(37, 99, 235, 0.04)" : "transparent",
                                cursor: isLocked ? "not-allowed" : "pointer",
                                opacity: isLocked ? 0.75 : 1,
                                transition: "all 0.15s ease",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isLocked}
                                onChange={() => handleTogglePermission(perm.name)}
                                style={{ marginTop: "0.25rem" }}
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>
                                    {friendlyTitle}
                                  </span>
                                  {isLocked && (
                                    <span title="Critical Core Permission" style={{ display: "inline-flex" }}>
                                      <Lock size={12} color="var(--color-text-muted)" />
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.125rem" }}>
                                  {perm.description}
                                </div>
                                <code
                                  style={{
                                    display: "inline-block",
                                    fontSize: "0.6875rem",
                                    padding: "0.125rem 0.375rem",
                                    borderRadius: "4px",
                                    backgroundColor: "var(--color-surface-muted)",
                                    color: "var(--color-primary)",
                                    marginTop: "0.25rem",
                                  }}
                                >
                                  {perm.name}
                                </code>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "1rem 1.5rem",
                borderTop: "1px solid var(--color-border)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
                backgroundColor: "var(--color-surface)",
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="btn btn-secondary"
                disabled={updateMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="btn btn-primary"
                disabled={updateMutation.isPending}
                style={{ gap: "0.5rem" }}
              >
                {updateMutation.isPending ? "Saving Changes..." : "Save Role Permissions"}
                <Check size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
