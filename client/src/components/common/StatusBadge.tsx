interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const normalized = (status || "").toUpperCase();

  let badgeClass = "badge-neutral";
  let displayLabel = status || "Unknown";

  switch (normalized) {
    // Green / Success
    case "ACCEPTED":
    case "APPROVED":
    case "COMPLETED":
    case "PUBLISHED":
    case "ACTIVE":
      badgeClass = "badge-success";
      if (normalized === "ACCEPTED") displayLabel = "Accepted";
      if (normalized === "APPROVED") displayLabel = "Approved";
      if (normalized === "COMPLETED") displayLabel = "Completed";
      if (normalized === "PUBLISHED") displayLabel = "Published";
      if (normalized === "ACTIVE") displayLabel = "Active";
      break;

    // Amber / Warning
    case "PENDING":
    case "REVIEWING":
    case "SCHEDULED":
      badgeClass = "badge-warning";
      if (normalized === "PENDING") displayLabel = "Pending";
      if (normalized === "REVIEWING") displayLabel = "In Review";
      if (normalized === "SCHEDULED") displayLabel = "Scheduled";
      break;

    // Blue / Info
    case "INTERVIEW":
      badgeClass = "badge-info";
      displayLabel = "Interview";
      break;

    // Red / Danger
    case "REJECTED":
    case "TERMINATED":
      badgeClass = "badge-danger";
      if (normalized === "REJECTED") displayLabel = "Rejected";
      if (normalized === "TERMINATED") displayLabel = "Terminated";
      break;

    // Gray / Neutral
    case "WITHDRAWN":
    case "CANCELLED":
    case "CANCELED":
    case "CLOSED":
    case "DRAFT":
    case "INACTIVE":
    default:
      badgeClass = "badge-neutral";
      if (normalized === "WITHDRAWN") displayLabel = "Withdrawn";
      if (normalized === "CANCELLED" || normalized === "CANCELED") displayLabel = "Cancelled";
      if (normalized === "CLOSED") displayLabel = "Closed";
      if (normalized === "DRAFT") displayLabel = "Draft";
      if (normalized === "INACTIVE") displayLabel = "Inactive";
      break;
  }

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: "currentColor",
          opacity: 0.8,
        }}
      />
      {displayLabel}
    </span>
  );
}
