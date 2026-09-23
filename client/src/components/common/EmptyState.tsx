import React from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    to?: string;
    icon?: LucideIcon;
  };
  children?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
  className = "",
}: EmptyStateProps) {
  const ActionIcon = action?.icon;

  return (
    <div
      className={`card ${className}`}
      style={{
        padding: "3.5rem 1.5rem",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        margin: "1rem 0",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "var(--radius-xl)",
          backgroundColor: "var(--color-surface-muted)",
          color: "var(--color-text-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.25rem",
          border: "1px solid var(--color-border)",
        }}
      >
        <Icon size={26} strokeWidth={1.75} />
      </div>

      <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text)", margin: "0 0 0.5rem" }}>
        {title}
      </h3>

      {description && (
        <p
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "0.875rem",
            maxWidth: "420px",
            lineHeight: 1.5,
            margin: "0 0 1.5rem",
          }}
        >
          {description}
        </p>
      )}

      {action && (
        <>
          {action.to ? (
            <Link to={action.to} className="btn btn-primary">
              {ActionIcon && <ActionIcon size={16} />}
              {action.label}
            </Link>
          ) : (
            <button type="button" onClick={action.onClick} className="btn btn-primary">
              {ActionIcon && <ActionIcon size={16} />}
              {action.label}
            </button>
          )}
        </>
      )}

      {children}
    </div>
  );
}
