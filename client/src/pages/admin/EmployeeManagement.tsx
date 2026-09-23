import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import EmployeeTable from "./components/EmployeeTable";
import CreateEmployeeModal from "./components/CreateEmployeeModal";
import EditEmployeeModal from "./components/EditEmployeeModal";
import EditRoleModal from "./components/EditRoleModal";
import EmployeeDetailsModal from "./components/EmployeeDetailsModal";
import { LogOut, Plus, Search, Users, Building, UserCheck, Clock, AlertCircle, ChevronRight } from "lucide-react";
import type { Employee } from "../../types/employee";
import BackButton from "../../components/common/BackButton";

export default function EmployeeManagement() {
  const { logout, user } = useAuth();
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [roleEditingEmployee, setRoleEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await api.get("/employees");
      return response.data.data.employees as Employee[];
    },
  });

  // Derived Statistics
  const stats = useMemo(() => {
    if (!data) return { total: 0, active: 0, departments: 0, recent: 0 };
    
    const active = data.filter(e => e.status === "ACTIVE").length;
    const depts = new Set(data.map(e => e.employeeProfile?.department).filter(Boolean)).size;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = data.filter(e => new Date(e.created_at) > thirtyDaysAgo).length;

    return { total: data.length, active, departments: depts, recent };
  }, [data]);

  // Unique departments for filter
  const departmentsList = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.map(e => e.employeeProfile?.department).filter(Boolean))) as string[];
  }, [data]);

  // Filtering
  const filteredEmployees = useMemo(() => {
    if (!data) return [];
    return data.filter((emp) => {
      const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
      const matchesSearch = fullName.includes(search.toLowerCase()) || emp.email.toLowerCase().includes(search.toLowerCase());
      const empDept = emp.employeeProfile?.department || "Not assigned";
      const matchesDept = departmentFilter === "ALL" || empDept === departmentFilter;
      const matchesStatus = statusFilter === "ALL" || emp.status === statusFilter;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [data, search, departmentFilter, statusFilter]);

  const handleClearFilters = () => {
    setSearch("");
    setDepartmentFilter("ALL");
    setStatusFilter("ALL");
  };

  return (
    <div className="dashboard-container">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", marginBottom: "0.5rem" }}>
        <BackButton label="Back to Dashboard" fallback="/admin/dashboard" style={{ marginBottom: 0 }} />
        <div className="breadcrumb" style={{ margin: 0 }}>
          Dashboard <ChevronRight size={14} /> <span style={{ color: "var(--text-main)", fontWeight: 500 }}>Employee Management</span>
        </div>
      </div>
      
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Employee Management</h1>
          <p className="dashboard-subtitle">Manage your company's employee accounts, access, and departments.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Welcome, <strong>{user?.first_name}</strong>
          </span>
          <button onClick={logout} className="btn btn-secondary">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Users size={16}/> Total Employees</h3>
          <div className="card-value">{isLoading ? <div className="skeleton" style={{ height: "2rem", width: "50px" }} /> : stats.total}</div>
        </div>
        <div className="card">
          <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><UserCheck size={16}/> Active Employees</h3>
          <div className="card-value">{isLoading ? <div className="skeleton" style={{ height: "2rem", width: "50px" }} /> : stats.active}</div>
        </div>
        <div className="card">
          <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Building size={16}/> Departments</h3>
          <div className="card-value">{isLoading ? <div className="skeleton" style={{ height: "2rem", width: "50px" }} /> : stats.departments}</div>
        </div>
        <div className="card">
          <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Clock size={16}/> Joined Recently</h3>
          <div className="card-value">{isLoading ? <div className="skeleton" style={{ height: "2rem", width: "50px" }} /> : stats.recent}</div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="filter-bar">
        <div className="input-group">
          <Search size={16} className="input-group-icon" />
          <input
            type="text"
            className="input-field"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "250px" }}
          />
        </div>
        
        <select 
          className="input-field" 
          value={departmentFilter} 
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option value="ALL">All Departments</option>
          {departmentsList.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        <select 
          className="input-field" 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
        </select>

        {(search || departmentFilter !== "ALL" || statusFilter !== "ALL") && (
          <button onClick={handleClearFilters} className="btn btn-ghost" style={{ fontSize: "0.75rem" }}>
            Clear Filters
          </button>
        )}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Showing {filteredEmployees.length} employees
          </span>
          <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
            <Plus size={16} /> Add Employee
          </button>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Status</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td><div className="skeleton" style={{ height: "24px", width: "150px" }} /></td>
                  <td><div className="skeleton" style={{ height: "20px", width: "100px" }} /></td>
                  <td><div className="skeleton" style={{ height: "24px", width: "60px", borderRadius: "12px" }} /></td>
                  <td><div className="skeleton" style={{ height: "20px", width: "80px" }} /></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : isError ? (
        <div className="empty-state">
          <div className="empty-state-icon" style={{ backgroundColor: "var(--danger-bg)", color: "var(--danger)" }}>
            <AlertCircle size={32} />
          </div>
          <h3 style={{ margin: "0 0 0.5rem 0" }}>Failed to load employees</h3>
          <p style={{ color: "var(--text-muted)", margin: "0 0 1.5rem 0" }}>An error occurred while communicating with the server.</p>
          <button onClick={() => refetch()} className="btn btn-secondary">Try Again</button>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Users size={32} />
          </div>
          <h3 style={{ margin: "0 0 0.5rem 0" }}>No employees found</h3>
          <p style={{ color: "var(--text-muted)", margin: "0 0 1.5rem 0" }}>
            {data?.length === 0 
              ? "You haven't added any employees to the system yet." 
              : "No employees match your current search and filter criteria."}
          </p>
          {data?.length === 0 ? (
            <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
              <Plus size={16} /> Add First Employee
            </button>
          ) : (
            <button onClick={handleClearFilters} className="btn btn-secondary">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <EmployeeTable 
          employees={filteredEmployees} 
          onEdit={(emp) => setEditingEmployee(emp)} 
          onEditRole={(emp) => setRoleEditingEmployee(emp)}
          onView={(emp) => setViewingEmployee(emp)}
          refetch={refetch}
        />
      )}

      {/* Modals */}
      {isCreateOpen && (
        <CreateEmployeeModal 
          onClose={() => setIsCreateOpen(false)} 
          onSuccess={() => {
            setIsCreateOpen(false);
            refetch();
          }} 
        />
      )}

      {editingEmployee && (
        <EditEmployeeModal 
          employee={editingEmployee} 
          onClose={() => setEditingEmployee(null)} 
          onSuccess={() => {
            setEditingEmployee(null);
            refetch();
          }} 
        />
      )}

      {roleEditingEmployee && (
        <EditRoleModal 
          employee={roleEditingEmployee} 
          onClose={() => setRoleEditingEmployee(null)} 
          onSuccess={() => {
            setRoleEditingEmployee(null);
            refetch();
          }} 
        />
      )}

      {viewingEmployee && (
        <EmployeeDetailsModal 
          employee={viewingEmployee} 
          onClose={() => setViewingEmployee(null)} 
        />
      )}
    </div>
  );
}
