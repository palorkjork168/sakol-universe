import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../services/api";
import type { Employee } from "../../../types/employee";
import { X, Loader2 } from "lucide-react";

interface EditRoleModalProps {
  employee: Employee;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditRoleModal({ employee, onClose, onSuccess }: EditRoleModalProps) {
  const queryClient = useQueryClient();
  const [role, setRole] = useState(employee.Roles?.[0]?.name || "EMPLOYEE");

  const updateRoleMutation = useMutation({
    mutationFn: async (newRole: string) => {
      const response = await api.put(`/employees/${employee.id}/role`, { role: newRole });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      alert("Role updated successfully!");
      onSuccess();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to update role");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRoleMutation.mutate(role);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "400px" }}>
        <div className="modal-header">
          <div>
            <h2 style={{ margin: "0 0 0.25rem 0", fontSize: "1.25rem" }}>Change Role</h2>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Update access level for {employee.first_name} {employee.last_name}
            </p>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">
                System Role <span className="required">*</span>
              </label>
              <select
                className="input-field"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="ADMIN">Admin</option>
                <option value="JOB_SEEKER">Job Seeker</option>
                <option value="EMPLOYER">Employer</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateRoleMutation.isPending}
              className="btn btn-primary"
            >
              {updateRoleMutation.isPending ? (
                <>
                  <Loader2 size={16} className="spinner" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
