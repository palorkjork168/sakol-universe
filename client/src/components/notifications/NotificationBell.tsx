import { useState } from "react";
import { Bell } from "lucide-react";
import { useUnreadCount } from "../../hooks/useNotifications";
import NotificationDropdown from "./NotificationDropdown";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadCount();

  const displayCount = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="btn btn-ghost"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
        aria-expanded={isOpen}
        style={{
          position: "relative",
          padding: "0.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isOpen ? "var(--color-primary, #2563eb)" : "var(--color-text-secondary, #64748b)",
          backgroundColor: isOpen ? "var(--color-primary-soft, rgba(37, 99, 235, 0.08))" : "transparent",
          borderRadius: "var(--radius-md, 0.375rem)",
          transition: "all 0.15s ease",
        }}
        title="Notifications"
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              backgroundColor: "#ef4444",
              color: "#ffffff",
              fontSize: "0.6875rem",
              fontWeight: 700,
              minWidth: "18px",
              height: "18px",
              lineHeight: "18px",
              borderRadius: "9999px",
              textAlign: "center",
              padding: "0 4px",
              boxShadow: "0 0 0 2px var(--color-surface, #ffffff)",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {displayCount}
          </span>
        )}
      </button>

      <NotificationDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        unreadCount={unreadCount}
      />
    </div>
  );
}
