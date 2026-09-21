import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useMyAttendance, useCheckIn, useCheckOut } from "../../hooks/useAttendance";
import { LogOut, MapPin, Clock, Calendar, Briefcase, Loader2, AlertCircle } from "lucide-react";
import CheckOutDialog from "../../components/employee/CheckOutDialog";

export default function EmployeeDashboard() {
  const { user, logout, isEmployee } = useAuth();
  const navigate = useNavigate();
  
  const { data: attendances, isLoading, isError, refetch } = useMyAttendance(isEmployee);
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const [locationStatus, setLocationStatus] = useState<string>("");
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [currentDuration, setCurrentDuration] = useState<string>("00h 00m");

  // Check if there is an active (not checked out) attendance record
  const activeAttendance = useMemo(() => {
    if (!attendances) return null;
    return attendances.find((a) => !a.check_out_time) || null;
  }, [attendances]);

  // Get today's attendance record (active record or latest today record)
  const todayAttendance = useMemo(() => {
    if (!attendances) return null;
    if (activeAttendance) return activeAttendance;

    const now = new Date();
    const todayUtc = now.toISOString().split("T")[0];
    const todayLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    return attendances.find((a) => {
      const timeStr = a.check_in_time || a.created_at || "";
      return typeof timeStr === "string" && (timeStr.startsWith(todayUtc) || timeStr.startsWith(todayLocal));
    }) || null;
  }, [attendances, activeAttendance]);

  // Determine State
  const attendanceState = useMemo(() => {
    if (activeAttendance) return "WORKING";
    if (todayAttendance?.check_out_time) return "COMPLETED";
    return "NOT_CHECKED_IN";
  }, [activeAttendance, todayAttendance]);

  // Update live duration if Working
  useEffect(() => {
    if (attendanceState === "WORKING" && todayAttendance?.check_in_time) {
      const interval = setInterval(() => {
        const start = new Date(todayAttendance.check_in_time).getTime();
        const now = new Date().getTime();
        const diffMs = now - start;
        
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        setCurrentDuration(`${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [attendanceState, todayAttendance]);

  // Calculate final duration if Completed
  const finalDuration = useMemo(() => {
    if (attendanceState === "COMPLETED" && todayAttendance?.check_in_time && todayAttendance?.check_out_time) {
      const start = new Date(todayAttendance.check_in_time).getTime();
      const end = new Date(todayAttendance.check_out_time).getTime();
      const diffMs = end - start;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m`;
    }
    return "00h 00m";
  }, [attendanceState, todayAttendance]);

  const handleGeolocation = (): Promise<{ latitude: number, longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            reject(new Error("Location permission is required to check in. Please allow location access in your browser and try again."));
          } else {
            reject(new Error("Unable to retrieve your location. Please check your connection or device settings."));
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const handleCheckIn = async () => {
    setLocationStatus("Getting your location...");
    try {
      const coords = await handleGeolocation();
      setLocationStatus("Checking you in...");
      await checkInMutation.mutateAsync(coords);
      setLocationStatus("");
      alert("Checked in successfully.");
    } catch (error: any) {
      setLocationStatus("");
      alert(error.message || "Unable to check in. Please try again.");
    }
  };

  const handleCheckOut = async () => {
    setLocationStatus("Getting your location...");
    try {
      const coords = await handleGeolocation();
      setLocationStatus("Checking you out...");
      await checkOutMutation.mutateAsync(coords);
      setLocationStatus("");
      setIsCheckOutOpen(false);
      alert("Checked out successfully.");
    } catch (error: any) {
      setLocationStatus("");
      setIsCheckOutOpen(false);
      alert(error.message || "Unable to check out. Please try again.");
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(undefined, {
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="skeleton" style={{ height: "40px", width: "250px", marginBottom: "2rem" }} />
        <div className="skeleton" style={{ height: "300px", width: "100%", borderRadius: "var(--radius-lg)" }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="dashboard-container empty-state">
        <div className="empty-state-icon" style={{ backgroundColor: "var(--danger-bg)", color: "var(--danger)" }}>
          <AlertCircle size={32} />
        </div>
        <h3 style={{ margin: "0 0 0.5rem 0" }}>Unable to load attendance</h3>
        <p style={{ color: "var(--text-muted)", margin: "0 0 1.5rem 0" }}>We couldn't retrieve your attendance information.</p>
        <button onClick={() => refetch()} className="btn btn-secondary">Try Again</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header" style={{ alignItems: "center" }}>
        <div>
          <h1 className="dashboard-title">Good morning, {user?.first_name}</h1>
          <p className="dashboard-subtitle">Here's your attendance overview for today.</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={() => navigate("/employee/leave")} className="btn btn-secondary">
            <Calendar size={16} /> My Leave
          </button>
          <button onClick={() => navigate("/employee/attendance")} className="btn btn-secondary">
            <Calendar size={16} /> History
          </button>
          <button onClick={logout} className="btn btn-secondary">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "1fr", maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Main Attendance Card */}
        <div className="card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
          <h2 style={{ fontSize: "1.25rem", margin: "0 0 1.5rem 0", color: "var(--text-muted)" }}>Today's Attendance</h2>
          
          {attendanceState === "NOT_CHECKED_IN" && (
            <>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                <span className="badge badge-gray" style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}>Not Checked In</span>
              </div>
              <p style={{ color: "var(--text-main)", marginBottom: "2rem", fontSize: "1.125rem" }}>You haven't checked in yet.</p>
              
              <button 
                onClick={handleCheckIn} 
                className="btn btn-primary" 
                style={{ padding: "0.75rem 2rem", fontSize: "1.125rem" }}
                disabled={checkInMutation.isPending || !!locationStatus}
              >
                {(checkInMutation.isPending || !!locationStatus) ? (
                  <><Loader2 size={20} className="spinner" /> {locationStatus || "Checking in..."}</>
                ) : "Check In"}
              </button>
              <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--text-light)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}>
                <MapPin size={12} /> Location required for check-in
              </div>
            </>
          )}

          {attendanceState === "WORKING" && (
            <>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                <span className="badge badge-success" style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}>Working</span>
              </div>
              <p style={{ color: "var(--text-muted)", margin: "0" }}>Working for</p>
              <h1 style={{ fontSize: "3rem", margin: "0.5rem 0 2rem 0", color: "var(--primary)", fontFamily: "monospace" }}>{currentDuration}</h1>
              
              <button 
                onClick={() => setIsCheckOutOpen(true)} 
                className="btn btn-secondary" 
                style={{ padding: "0.75rem 2rem", fontSize: "1.125rem", borderColor: "var(--border-color)" }}
              >
                Check Out
              </button>
            </>
          )}

          {attendanceState === "COMPLETED" && (
            <>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                <span className="badge badge-gray" style={{ fontSize: "0.875rem", padding: "0.5rem 1rem", backgroundColor: "var(--border-light)", color: "var(--text-main)" }}>Completed</span>
              </div>
              <p style={{ color: "var(--text-muted)", margin: "0" }}>Today's work duration</p>
              <h1 style={{ fontSize: "2.5rem", margin: "0.5rem 0 2rem 0", color: "var(--text-main)" }}>{finalDuration}</h1>
              <p style={{ color: "var(--text-light)", fontSize: "0.875rem" }}>
                Great job today! You've completed your work session.
              </p>
            </>
          )}
        </div>

        {/* Quick Info Cards */}
        <div className="summary-cards" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 0 }}>
          <div className="card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
              <Clock size={16} /> <span style={{ fontSize: "0.875rem" }}>Check-in</span>
            </div>
            <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--text-main)" }}>
              {todayAttendance?.check_in_time ? formatTime(todayAttendance.check_in_time) : "Not yet"}
            </div>
          </div>
          
          <div className="card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
              <Clock size={16} /> <span style={{ fontSize: "0.875rem" }}>Check-out</span>
            </div>
            <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--text-main)" }}>
              {todayAttendance?.check_out_time ? formatTime(todayAttendance.check_out_time) : "Not yet"}
            </div>
          </div>
          
          <div className="card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
              <Briefcase size={16} /> <span style={{ fontSize: "0.875rem" }}>Department</span>
            </div>
            <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--text-main)" }}>
              {user?.department || "General"}
            </div>
          </div>
        </div>

      </div>

      {isCheckOutOpen && (
        <CheckOutDialog 
          onClose={() => setIsCheckOutOpen(false)}
          onConfirm={handleCheckOut}
          isSubmitting={checkOutMutation.isPending || !!locationStatus}
        />
      )}
    </div>
  );
}
