import { useState, type FormEvent } from "react";

export type PresetKey = "7d" | "30d" | "90d" | "year" | "all" | "custom";

interface DateRangeFilterProps {
  from?: string;
  to?: string;
  onRangeChange: (from: string, to: string) => void;
  className?: string;
}

export function DateRangeFilter({
  from,
  to,
  onRangeChange,
  className = "",
}: DateRangeFilterProps) {
  const [activePreset, setActivePreset] = useState<PresetKey>("30d");
  const [customFrom, setCustomFrom] = useState(from || "");
  const [customTo, setCustomTo] = useState(to || "");
  const [showCustom, setShowCustom] = useState(false);

  const applyPreset = (preset: PresetKey) => {
    setActivePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    if (preset === "7d") {
      setShowCustom(false);
      const past = new Date(today.getTime() - 7 * 86400000);
      onRangeChange(past.toISOString().split("T")[0], todayStr);
    } else if (preset === "30d") {
      setShowCustom(false);
      const past = new Date(today.getTime() - 30 * 86400000);
      onRangeChange(past.toISOString().split("T")[0], todayStr);
    } else if (preset === "90d") {
      setShowCustom(false);
      const past = new Date(today.getTime() - 90 * 86400000);
      onRangeChange(past.toISOString().split("T")[0], todayStr);
    } else if (preset === "year") {
      setShowCustom(false);
      const startOfYear = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
      onRangeChange(startOfYear.toISOString().split("T")[0], todayStr);
    } else if (preset === "all") {
      setShowCustom(false);
      // Sensible all-time range start (platform genesis)
      onRangeChange("2024-01-01", todayStr);
    } else if (preset === "custom") {
      setShowCustom(true);
    }
  };

  const handleCustomApply = (e: FormEvent) => {
    e.preventDefault();
    if (customFrom && customTo && customFrom <= customTo) {
      setActivePreset("custom");
      onRangeChange(customFrom, customTo);
    }
  };

  return (
    <div
      className={`date-range-filter-container ${className}`}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
        background: "var(--color-bg-card, #ffffff)",
        padding: "0.75rem 1rem",
        borderRadius: "var(--radius-lg, 12px)",
        border: "1px solid var(--color-border, #e2e8f0)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--color-text-muted, #64748b)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginRight: "0.25rem",
          }}
        >
          Range:
        </span>
        {(
          [
            { key: "7d", label: "7 Days" },
            { key: "30d", label: "30 Days" },
            { key: "90d", label: "90 Days" },
            { key: "year", label: "This Year" },
            { key: "all", label: "All Time" },
            { key: "custom", label: "Custom" },
          ] as const
        ).map((p) => {
          const isActive = activePreset === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => applyPreset(p.key)}
              style={{
                padding: "0.35rem 0.75rem",
                borderRadius: "var(--radius-md, 8px)",
                fontSize: "0.85rem",
                fontWeight: isActive ? 600 : 500,
                cursor: "pointer",
                border: "1px solid",
                borderColor: isActive ? "var(--color-primary, #2563eb)" : "var(--color-border, #e2e8f0)",
                background: isActive ? "var(--color-primary, #2563eb)" : "transparent",
                color: isActive ? "#ffffff" : "var(--color-text-secondary, #475569)",
                transition: "all 0.15s ease",
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {showCustom && (
        <form
          onSubmit={handleCustomApply}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            style={{
              padding: "0.35rem 0.6rem",
              borderRadius: "var(--radius-md, 8px)",
              border: "1px solid var(--color-border, #cbd5e1)",
              fontSize: "0.85rem",
              color: "var(--color-text-main, #1e293b)",
            }}
            required
          />
          <span style={{ color: "var(--color-text-muted, #94a3b8)", fontSize: "0.85rem" }}>to</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            style={{
              padding: "0.35rem 0.6rem",
              borderRadius: "var(--radius-md, 8px)",
              border: "1px solid var(--color-border, #cbd5e1)",
              fontSize: "0.85rem",
              color: "var(--color-text-main, #1e293b)",
            }}
            required
          />
          <button
            type="submit"
            style={{
              padding: "0.35rem 0.85rem",
              borderRadius: "var(--radius-md, 8px)",
              background: "var(--color-primary, #2563eb)",
              color: "#ffffff",
              border: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Apply
          </button>
        </form>
      )}

      {from && to && !showCustom && (
        <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted, #64748b)" }}>
          {from} — {to}
        </div>
      )}
    </div>
  );
};
