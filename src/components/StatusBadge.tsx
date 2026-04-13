interface StatusBadgeProps {
  status: string;
  present: boolean;
}

export function StatusBadge({ status, present }: StatusBadgeProps) {
  if (!present) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
        Ghost
      </span>
    );
  }

  const config = {
    OK: { bg: "bg-emerald-950", text: "text-emerald-400", dot: "bg-emerald-400" },
    Error: { bg: "bg-red-950", text: "text-red-400", dot: "bg-red-400 animate-pulse" },
    Unknown: { bg: "bg-amber-950", text: "text-amber-400", dot: "bg-amber-400" },
    Degraded: { bg: "bg-orange-950", text: "text-orange-400", dot: "bg-orange-400" },
  }[status] ?? { bg: "bg-zinc-800", text: "text-zinc-400", dot: "bg-zinc-500" };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}
