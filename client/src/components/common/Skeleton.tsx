import type { CSSProperties } from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({
  width = "100%",
  height = "1rem",
  borderRadius = "var(--radius-md)",
  className = "",
  style,
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({
  lines = 3,
  className = "",
  style,
}: {
  lines?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const widths = ["100%", "92%", "78%", "85%", "60%"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", ...style }} className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="0.875rem"
          width={widths[i % widths.length]}
          borderRadius="var(--radius-sm)"
        />
      ))}
    </div>
  );
}

export function SkeletonCard({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`card ${className}`} style={{ padding: "1.5rem", ...style }}>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
        <Skeleton width={44} height={44} borderRadius="var(--radius-md)" />
        <div style={{ flex: 1 }}>
          <Skeleton height="1.125rem" width="65%" style={{ marginBottom: "0.375rem" }} />
          <Skeleton height="0.8125rem" width="40%" />
        </div>
      </div>
      <SkeletonText lines={2} style={{ marginBottom: "1.25rem" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Skeleton height="1rem" width="30%" />
        <Skeleton height="1rem" width="20%" />
      </div>
    </div>
  );
}

export function SkeletonStatCard({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`card stat-card ${className}`} style={{ padding: "1.5rem", ...style }}>
      <Skeleton width={48} height={48} borderRadius="var(--radius-md)" />
      <div style={{ flex: 1 }}>
        <Skeleton height="0.8125rem" width="55%" style={{ marginBottom: "0.5rem" }} />
        <Skeleton height="1.75rem" width="40%" />
      </div>
    </div>
  );
}

export function SkeletonTableRow({
  cols = 5,
  className = "",
}: {
  cols?: number;
  className?: string;
}) {
  return (
    <tr className={className}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: "1rem" }}>
          <Skeleton height="1rem" width={i === 0 ? "70%" : i === cols - 1 ? "40%" : "60%"} />
        </td>
      ))}
    </tr>
  );
}

export default Skeleton;
