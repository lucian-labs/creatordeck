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
    <header className="header">
      <div className="header-brand">
        <Monitor />
        <div>
          <div className="header-title">CreatorDeck</div>
          <div className="header-sub">Device health dashboard</div>
        </div>
      </div>
      <div className="header-right">
        <span className="header-time">{timeStr}</span>
        <button className="btn-icon" onClick={onRefresh} disabled={loading} title="Refresh now">
          <RefreshCw className={loading ? "spin" : ""} />
        </button>
      </div>
    </header>
  );
}
