import { useNavigate } from "react-router-dom";
import { useMyAttendance } from "../../hooks/useAttendance";
import { ChevronLeft, Calendar as CalendarIcon, AlertCircle, Calendar } from "lucide-react";
import type { Attendance } from "../../types/attendance";

export default function AttendanceHistory() {
  const navigate = useNavigate();
  const { data: attendances, isLoading, isError, refetch } = useMyAttendance();

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleTimeString(undefined, {
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const getDuration = (startString: string, endString: string | null) => {
    if (!endString) return "—";
    const start = new Date(startString).getTime();
    const end = new Date(endString).getTime();
    const diffMs = end - start;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  };

  const getStatus = (att: Attendance) => {
    if (att.check_out_time) {
      return <span className="badge badge-gray" style={{ backgroundColor: "var(--border-light)", color: "var(--text-main)" }}>Completed</span>;
    }
    return <span className="badge badge-success">Working</span>;
  };

  const sortedAttendances = attendances ? [...attendances].sort((a, b) => {
    const timeA = new Date(a.check_in_time || a.created_at || 0).getTime();
    const timeB = new Date(b.check_in_time || b.created_at || 0).getTime();
    return timeB - timeA;
  }) : [];

  return (
    <div className="dashboard-container">
      <div className="breadcrumb" style={{ cursor: "pointer" }} onClick={() => navigate("/employee/dashboard")}>
        <ChevronLeft size={16} style={{ marginLeft: "-4px" }} /> Back to Dashboard
      </div>
      
      <header className="dashboard-header" style={{ alignItems: "center" }}>
        <div>
          <h1 className="dashboard-title">Attendance History</h1>
          <p className="dashboard-subtitle">Review your past check-ins and work sessions.</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={() => navigate("/employee/leave")} className="btn btn-secondary">
            <Calendar size={16} /> My Leave
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td><div className="skeleton" style={{ height: "20px", width: "100px" }} /></td>
                  <td><div className="skeleton" style={{ height: "20px", width: "80px" }} /></td>
                  <td><div className="skeleton" style={{ height: "20px", width: "80px" }} /></td>
                  <td><div className="skeleton" style={{ height: "20px", width: "80px" }} /></td>
                  <td><div className="skeleton" style={{ height: "24px", width: "80px", borderRadius: "12px" }} /></td>
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
          <h3 style={{ margin: "0 0 0.5rem 0" }}>Unable to load history</h3>
          <p style={{ color: "var(--text-muted)", margin: "0 0 1.5rem 0" }}>We couldn't retrieve your attendance information.</p>
          <button onClick={() => refetch()} className="btn btn-secondary">Try Again</button>
        </div>
      ) : sortedAttendances.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <CalendarIcon size={32} />
          </div>
          <h3 style={{ margin: "0 0 0.5rem 0" }}>No attendance records yet</h3>
          <p style={{ color: "var(--text-muted)", margin: "0" }}>
            Your attendance history will appear here after you check in.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedAttendances.map((att) => (
                <tr key={att.id}>
                  <td style={{ fontWeight: 500 }}>{formatDate(att.created_at)}</td>
                  <td style={{ color: "var(--text-muted)" }}>{formatTime(att.check_in_time)}</td>
                  <td style={{ color: "var(--text-muted)" }}>{formatTime(att.check_out_time)}</td>
                  <td style={{ color: "var(--text-muted)", fontFamily: "monospace", fontSize: "0.95rem" }}>
                    {getDuration(att.check_in_time, att.check_out_time)}
                  </td>
                  <td>{getStatus(att)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
