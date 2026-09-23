import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 3800);
  }, [removeToast]);

  const toast = {
    success: (msg: string) => addToast("success", msg),
    error: (msg: string) => addToast("error", msg),
    info: (msg: string) => addToast("info", msg),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Render Portal */}
      <div
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          maxWidth: "380px",
          pointerEvents: "none",
        }}
        aria-live="polite"
      >
        {toasts.map((t) => {
          let bg = "var(--color-surface)";
          let border = "var(--color-border)";
          let iconColor = "var(--color-primary)";
          let Icon = Info;

          if (t.type === "success") {
            border = "var(--color-success-border)";
            iconColor = "var(--color-success)";
            Icon = CheckCircle2;
          } else if (t.type === "error") {
            border = "var(--color-danger-border)";
            iconColor = "var(--color-danger)";
            Icon = AlertCircle;
          }

          return (
            <div
              key={t.id}
              className="card"
              style={{
                pointerEvents: "auto",
                backgroundColor: bg,
                border: `1px solid ${border}`,
                boxShadow: "var(--shadow-lg)",
                borderRadius: "var(--radius-md)",
                padding: "0.75rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                animation: "modalSlideUp 200ms ease-out forwards",
              }}
            >
              <Icon size={18} style={{ color: iconColor, flexShrink: 0 }} />
              <span style={{ fontSize: "0.875rem", color: "var(--color-text)", fontWeight: 500, flex: 1 }}>
                {t.message}
              </span>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                  padding: "2px",
                  display: "flex",
                  alignItems: "center",
                }}
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context.toast;
}
