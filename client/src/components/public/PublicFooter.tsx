import { Link } from "react-router-dom";
import { Briefcase, Globe, Shield } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <div className="brand-icon" style={{ width: "32px", height: "32px" }}>
              <Briefcase size={16} />
            </div>
            <h3 style={{ margin: 0, fontSize: "1.125rem", color: "#ffffff" }}>Sakol Universe</h3>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem", lineHeight: 1.6, maxWidth: "320px" }}>
            The premier career and talent marketplace connecting forward-thinking companies with exceptional professionals across Cambodia and Southeast Asia.
          </p>
        </div>

        <div className="footer-column">
          <h4>Job Seekers</h4>
          <ul>
            <li><Link to="/jobs">Browse All Jobs</Link></li>
            <li><Link to="/jobs?is_remote=true">Remote Jobs</Link></li>
            <li><Link to="/jobs?employment_type=FULL_TIME">Full-Time Careers</Link></li>
            <li><Link to="/jobs?employment_type=INTERNSHIP">Internships</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Categories</h4>
          <ul>
            <li><Link to="/jobs?industry=Technology">Technology & IT</Link></li>
            <li><Link to="/jobs?industry=Finance">Finance & Banking</Link></li>
            <li><Link to="/jobs?industry=Engineering">Engineering</Link></li>
            <li><Link to="/jobs?industry=Marketing">Marketing & Sales</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Platform</h4>
          <ul>
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/register">Create Account</Link></li>
            <li style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "#64748b", fontSize: "0.875rem" }}>
              <Shield size={14} /> Verified System
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "#64748b", fontSize: "0.875rem" }}>
              <Globe size={14} /> English (EN)
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div>&copy; {new Date().getFullYear()} Sakol Universe. All rights reserved.</div>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Contact Support</span>
        </div>
      </div>
    </footer>
  );
}
