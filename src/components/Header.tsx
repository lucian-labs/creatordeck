import { Monitor, RefreshCw } from "lucide-react";

interface HeaderProps {
  lastRefresh: Date | null;
  loading: boolean;
  onRefresh: () => void;
}

export function Header({ lastRefresh, loading, onRefresh }: HeaderProps) {
  const timeStr = lastRefresh
    ? lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--:--:--";

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-accent/10 p-2">
          <Monitor className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">CreatorDeck</h1>
          <p className="text-xs text-muted">Device health dashboard</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted">
          Last scan: {timeStr}
        </span>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="rounded-lg p-2 text-muted hover:text-white hover:bg-surface-hover transition-colors"
          title="Refresh now"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
    </header>
  );
}
