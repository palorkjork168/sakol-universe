import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({
  requireAdmin = false,
  requireEmployee = false,
  requireJobSeeker = false,
  requireEmployer = false,
}: {
  requireAdmin?: boolean;
  requireEmployee?: boolean;
  requireJobSeeker?: boolean;
  requireEmployer?: boolean;
}) {
  const { user, isLoading, isAdmin, isEmployee, isJobSeeker, isEmployer } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <div className="skeleton" style={{ width: "150px", height: "24px" }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <div style={{ padding: "20px", color: "red" }}>You do not have permission to perform this action.</div>;
  }

  if (requireEmployee && !isEmployee && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireJobSeeker && !isJobSeeker && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireEmployer && !isEmployer && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
