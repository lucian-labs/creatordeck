interface StatusBadgeProps {
  status: string;
  present: boolean;
}

export function StatusBadge({ status, present }: StatusBadgeProps) {
  const variant = !present ? "ghost" : status === "OK" ? "ok" : status === "Error" ? "error" : "warning";

  return (
    <span className={`badge badge--${variant}`}>
      <span className="badge-dot" />
      {present ? status : "Ghost"}
    </span>
  );
}
