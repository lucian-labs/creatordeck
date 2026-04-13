import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Clock, Plug, Unplug, AlertTriangle, CheckCircle, ArrowRightLeft, Trash2 } from "lucide-react";
import type { TimelineEvent } from "../types";

const evtMap: Record<string, { icon: React.ElementType; cls: string }> = {
  connected: { icon: Plug, cls: "badge--ok" },
  disconnected: { icon: Unplug, cls: "badge--error" },
  error: { icon: AlertTriangle, cls: "badge--error" },
  recovered: { icon: CheckCircle, cls: "badge--ok" },
  changed: { icon: ArrowRightLeft, cls: "badge--warning" },
};

export function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  const refresh = useCallback(async () => {
    try { setEvents((await invoke<TimelineEvent[]>("get_timeline_events")).reverse()); } catch {}
  }, []);

  useEffect(() => {
    refresh();
    const i = setInterval(refresh, 5000);
    return () => clearInterval(i);
  }, [refresh]);

  return (
    <div>
      <div className="flex-between">
        <div className="section-header">
          <Clock />
          <span className="section-title">Device Timeline</span>
        </div>
        <div className="flex-center gap-md">
          <span className="section-count">{events.length} events</span>
          {events.length > 0 && (
            <button className="btn-icon" onClick={async () => { await invoke("clear_timeline"); setEvents([]); }} title="Clear">
              <Trash2 />
            </button>
          )}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="timeline-empty">
          <Clock />
          <p>No device changes yet.</p>
          <p className="sub">Keep CreatorDeck running to track connects, disconnects, and errors.</p>
        </div>
      ) : (
        events.map((event, i) => {
          const cfg = evtMap[event.event_type] || evtMap.changed;
          const Icon = cfg.icon;
          return (
            <div key={`${event.timestamp}-${i}`} className="row" style={{ padding: "12px 20px" }}>
              <Icon style={{ width: 14, height: 14, marginTop: 2, flexShrink: 0 }} className={cfg.cls} />
              <div className="row-info">
                <div className="flex-between">
                  <span className="row-name" style={{ fontSize: 12 }}>{event.device_name}</span>
                  <span className={cfg.cls} style={{ fontSize: 10, fontWeight: 500, flexShrink: 0 }}>{event.event_type}</span>
                </div>
                <div className="flex-between" style={{ marginTop: 2 }}>
                  <span className="row-sub">{event.detail}</span>
                  <span style={{ fontSize: 10, color: "var(--text-dim)", flexShrink: 0 }}>{event.timestamp.split(" ")[1] || event.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
