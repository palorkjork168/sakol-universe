import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import { Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import RequestLeaveModal from "../../components/employee/RequestLeaveModal";

export default function Leave() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: balance, isLoading: balanceLoading } = useQuery<any[]>({
    queryKey: ["leaveBalance"],
    queryFn: async () => {
      const res = await api.get("/leave/balance");
      return res.data.data;
    },
  });

  const { data: requests, isLoading: requestsLoading } = useQuery<any[]>({
    queryKey: ["myLeaveRequests"],
    queryFn: async () => {
      const res = await api.get("/leave/my");
      return res.data.data;
    },
  });

  const cancelMut = useMutation({
    mutationFn: async (id: string) => api.patch(`/leave/requests/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myLeaveRequests"] });
      queryClient.invalidateQueries({ queryKey: ["leaveBalance"] });
    },
  });

  if (balanceLoading || requestsLoading) {
    return <div className="dashboard-container" style={{ textAlign: "center", padding: "4rem" }}><Loader2 className="animate-spin" /></div>;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED": return <CheckCircle2 size={16} className="text-emerald-600" />;
      case "REJECTED": return <XCircle size={16} className="text-rose-600" />;
      case "PENDING": return <Clock size={16} className="text-amber-600" />;
      default: return <AlertCircle size={16} className="text-slate-500" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "APPROVED": return "badge-primary";
      case "REJECTED": return "badge-danger";
      case "PENDING": return "badge-warning";
      default: return "badge-gray";
    }
  };

  return (
    <div className="dashboard-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="dashboard-title">My Leave</h1>
          <p className="dashboard-subtitle">Manage your time off requests and view your balances.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <CalendarIcon size={18} /> Request Time Off
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
        {balance?.map((bal) => (
          <div key={bal.leave_type_id} className="card" style={{ padding: "1.5rem" }}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {bal.name}
            </h3>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem", display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
              {bal.remaining_days !== null ? bal.remaining_days : "âˆž"} <span style={{ fontSize: "1rem", color: "var(--text-muted)", fontWeight: 400 }}>days left</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "var(--text-muted)" }}>
              <span>Allowance: {bal.default_days !== null ? bal.default_days : "Unlimited"}</span>
              <span>Used: {bal.used_days}</span>
            </div>
          </div>
        ))}
        {balance?.length === 0 && (
          <div style={{ gridColumn: "1 / -1", padding: "2rem", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)", color: "var(--text-muted)" }}>
            No leave balances available.
          </div>
        )}
      </div>

      <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>Leave History</h2>
      
      {requests?.length === 0 ? (
        <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          You haven't requested any time off yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {requests?.map((req) => {
             const start = new Date(req.start_date);
             const end = new Date(req.end_date);
             const days = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
             
             return (
              <div key={req.id} className="card" style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div style={{ flex: 1, minWidth: "250px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <h4 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 600 }}>{req.leaveType?.name}</h4>
                    <span className={`badge ${getStatusBadgeClass(req.status)}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>
                      {getStatusIcon(req.status)} {req.status}
                    </span>
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                    {start.toLocaleDateString()} - {end.toLocaleDateString()} ({days} {days === 1 ? 'day' : 'days'})
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                    <strong>Reason:</strong> {req.reason}
                  </div>
                  {req.review_note && (
                    <div style={{ marginTop: "0.5rem", padding: "0.5rem 0.75rem", backgroundColor: "var(--bg-secondary)", borderLeft: "3px solid var(--border)", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                      <strong>Note:</strong> {req.review_note}
                    </div>
                  )}
                </div>
                {req.status === "PENDING" && (
                  <div>
                    <button onClick={() => { if(confirm("Are you sure you want to cancel this request?")) cancelMut.mutate(req.id); }} disabled={cancelMut.isPending} className="btn btn-secondary btn-sm" style={{ color: "var(--danger)" }}>
                      Cancel Request
                    </button>
                  </div>
                )}
              </div>
             );
          })}
        </div>
      )}

      {isModalOpen && <RequestLeaveModal onClose={() => setIsModalOpen(false)} balance={balance || []} />}
    </div>
  );
}
