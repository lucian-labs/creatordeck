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
  { icon: React.ElementType; color: string }
> = {
  connected: { icon: Plug, color: "text-ok" },
  disconnected: { icon: Unplug, color: "text-error" },
  error: { icon: AlertTriangle, color: "text-error" },
  recovered: { icon: CheckCircle, color: "text-ok" },
  changed: { icon: ArrowRightLeft, color: "text-warning" },
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Device Timeline
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted/50">{events.length} events</span>
          {events.length > 0 && (
            <button
              onClick={clearTimeline}
              className="p-1 text-muted hover:text-white transition-colors"
              title="Clear timeline"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-px">
        {events.length === 0 ? (
          <div className="py-8 space-y-2 text-center">
            <Clock className="w-6 h-6 text-zinc-700 mx-auto" />
            <p className="text-xs text-muted/60">
              No device changes yet.
            </p>
            <p className="text-[10px] text-muted/40">
              Keep CreatorDeck running to track connects, disconnects, and errors.
            </p>
          </div>
        ) : (
          events.map((event, i) => {
            const config = eventConfig[event.event_type] || eventConfig.changed;
            const Icon = config.icon;
            return (
              <div
                key={`${event.timestamp}-${i}`}
                className="flex items-start gap-3 border-b border-border/30 px-5 py-4"
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
                    <p className="text-[10px] text-muted/50 truncate">
                      {event.detail}
                    </p>
                    <span className="text-[10px] text-muted/40 shrink-0">
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
