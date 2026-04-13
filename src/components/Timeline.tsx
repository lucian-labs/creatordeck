import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Clock,
  Plug,
  Unplug,
  AlertTriangle,
  CheckCircle,
  ArrowRightLeft,
  Trash2,
} from "lucide-react";
import type { TimelineEvent } from "../types";

const eventConfig: Record<
  string,
  { icon: React.ElementType; color: string; bg: string }
> = {
  connected: { icon: Plug, color: "text-ok", bg: "bg-emerald-950/30" },
  disconnected: { icon: Unplug, color: "text-error", bg: "bg-red-950/30" },
  error: { icon: AlertTriangle, color: "text-error", bg: "bg-red-950/30" },
  recovered: { icon: CheckCircle, color: "text-ok", bg: "bg-emerald-950/30" },
  changed: { icon: ArrowRightLeft, color: "text-warning", bg: "bg-amber-950/30" },
};

export function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  const refresh = useCallback(async () => {
    try {
      const data = await invoke<TimelineEvent[]>("get_timeline_events");
      setEvents(data.reverse());
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  async function clearTimeline() {
    await invoke("clear_timeline");
    setEvents([]);
  }

  return (
    <div className="rounded-xl border border-border bg-surface-raised p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Device Timeline
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">{events.length} events</span>
          {events.length > 0 && (
            <button
              onClick={clearTimeline}
              className="p-1 rounded text-muted hover:text-white hover:bg-surface-hover transition-colors"
              title="Clear timeline"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1.5 max-h-80 overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <Clock className="w-8 h-8 text-zinc-700 mx-auto" />
            <p className="text-xs text-muted">
              No device changes detected yet.
            </p>
            <p className="text-[10px] text-zinc-600">
              Events appear when devices connect, disconnect, or change status.
              <br />
              Keep CreatorDeck running in the tray to track over time.
            </p>
          </div>
        ) : (
          events.map((event, i) => {
            const config = eventConfig[event.event_type] || eventConfig.changed;
            const Icon = config.icon;
            return (
              <div
                key={`${event.timestamp}-${i}`}
                className={`flex items-start gap-3 rounded-lg px-3 py-2 ${config.bg}`}
              >
                <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${config.color}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium truncate">
                      {event.device_name}
                    </p>
                    <span className={`text-[10px] font-medium shrink-0 ${config.color}`}>
                      {event.event_type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-[10px] text-muted truncate">
                      {event.detail}
                    </p>
                    <span className="text-[10px] text-zinc-600 shrink-0">
                      {event.timestamp.split(" ")[1] || event.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
