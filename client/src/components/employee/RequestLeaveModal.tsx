import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import { X, Calendar as CalendarIcon, Loader2 } from "lucide-react";

interface RequestLeaveModalProps {
  onClose: () => void;
  balance: any[];
}

export default function RequestLeaveModal({ onClose, balance }: RequestLeaveModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [error, setError] = useState("");

  const selectedType = balance.find(b => b.leave_type_id === formData.leave_type_id);

  let days = 0;
  if (formData.start_date && formData.end_date) {
    const s = new Date(formData.start_date);
    const e = new Date(formData.end_date);
    if (e >= s) {
      days = Math.ceil(Math.abs(e.getTime() - s.getTime()) / (1000 * 3600 * 24)) + 1;
    }
  }

  const submitMut = useMutation({
    mutationFn: async (data: any) => {
      // Ensure ISO string for dates (or at least valid Date format)
      return api.post("/leave/requests", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myLeaveRequests"] });
      queryClient.invalidateQueries({ queryKey: ["leaveBalance"] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to submit leave request");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.leave_type_id || !formData.start_date || !formData.end_date || !formData.reason) {
      setError("Please fill out all fields.");
      return;
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError("End date cannot be before start date.");
      return;
    }

    if (!selectedType) {
      setError("Invalid leave type selected.");
      return;
    }

    if (selectedType && selectedType.remaining_days !== null && days > selectedType.remaining_days) {
      setError("You do not have enough remaining days for this request.");
      return;
    }

    submitMut.mutate(formData);
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div className="card" style={{ width: "100%", maxWidth: "500px", padding: "2rem", position: "relative", overflowY: "auto", maxHeight: "90vh" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
          <X size={20} />
        </button>

        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CalendarIcon size={24} className="text-primary" /> Request Time Off
        </h2>

        {error && (
          <div style={{ padding: "0.75rem", backgroundColor: "var(--danger-bg)", color: "var(--danger)", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        {balance.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", backgroundColor: "var(--bg-secondary)", borderRadius: "var(--radius-md)" }}>
            <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.125rem", color: "var(--text-main)" }}>No leave policies available</h3>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Your employer hasn't configured leave policies yet. Please contact HR to set up leave types before requesting time off.
            </p>
            <button type="button" className="btn btn-secondary" style={{ marginTop: "1.5rem" }} onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label className="form-label">Leave Type *</label>
              <select
                className="form-control"
                value={formData.leave_type_id}
                onChange={(e) => setFormData({ ...formData, leave_type_id: e.target.value })}
                style={{ width: "100%" }}
              >
                <option value="">-- Select Leave Type --</option>
                {balance.map(b => (
                  <option key={b.leave_type_id} value={b.leave_type_id}>
                    {b.name} {b.remaining_days !== null ? `(${b.remaining_days} days left)` : "(Unlimited)"}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="form-label">Start Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label className="form-label">End Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    min={formData.start_date || new Date().toISOString().split("T")[0]}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>

            {days > 0 && (
              <div style={{ padding: "0.75rem", backgroundColor: "rgba(37, 99, 235, 0.05)", border: "1px solid rgba(37, 99, 235, 0.2)", borderRadius: "var(--radius-sm)", color: "var(--primary)", fontWeight: 500, fontSize: "0.875rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Requested Duration</span>
                <span>{days} calendar {days === 1 ? 'day' : 'days'}</span>
              </div>
            )}

            <div>
              <label className="form-label">Reason *</label>
              <textarea
                className="form-control"
                rows={3}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Briefly describe your reason for leave..."
                style={{ width: "100%", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }} onClick={onClose} disabled={submitMut.isPending}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={submitMut.isPending || !formData.leave_type_id}>
                {submitMut.isPending ? <Loader2 className="animate-spin" size={18} /> : "Submit Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
