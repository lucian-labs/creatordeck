interface StatusBadgeProps {
  status: string;
  present: boolean;
}

export function StatusBadge({ status, present }: StatusBadgeProps) {
  if (!present) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
        <span className="w-1.5 h-1.5 bg-zinc-600" />
        Ghost
      </span>
    );
  }

  const config = {
    OK: { text: "text-ok", dot: "bg-ok" },
    Error: { text: "text-error", dot: "bg-error animate-pulse" },
    Unknown: { text: "text-warning", dot: "bg-warning" },
    Degraded: { text: "text-orange-400", dot: "bg-orange-400" },
  }[status] ?? { text: "text-zinc-500", dot: "bg-zinc-600" };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium ${config.text}`}>
      <span className={`w-1.5 h-1.5 ${config.dot}`} />
      {status}
    </span>
  );
}
