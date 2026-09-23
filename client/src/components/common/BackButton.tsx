import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  label?: string;
  fallback?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const BackButton: React.FC<BackButtonProps> = ({
  label = "Back",
  fallback = "/",
  className = "",
  style,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    // If user has in-app history, navigate(-1). Otherwise go to fallback.
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`back-btn ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        background: "transparent",
        border: "none",
        padding: "0.375rem 0.625rem",
        borderRadius: "var(--radius-md)",
        color: "var(--color-text-secondary)",
        fontSize: "0.875rem",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all var(--transition-fast)",
        marginBottom: "0.75rem",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--color-primary)";
        e.currentTarget.style.backgroundColor = "var(--color-surface-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--color-text-secondary)";
        e.currentTarget.style.backgroundColor = "transparent";
      }}
      aria-label={`Go back to ${label}`}
    >
      <ArrowLeft size={16} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
};

export default BackButton;
