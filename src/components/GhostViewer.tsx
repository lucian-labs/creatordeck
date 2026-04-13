import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Ghost, Eye, Loader2, Camera, Mic, Usb, Monitor, HardDrive } from "lucide-react";
import type { GhostDevice } from "../types";

const classIcons: Record<string, React.ElementType> = {
  Camera, AudioEndpoint: Mic, USB: Usb, Monitor, HIDClass: HardDrive,
};

export function GhostViewer() {
  const [ghosts, setGhosts] = useState<GhostDevice[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try { setGhosts(await invoke<GhostDevice[]>("get_ghost_devices")); }
    catch { setGhosts([]); }
    finally { setLoading(false); }
  }

  if (ghosts === null) {
    return (
      <button onClick={load} disabled={loading} className="ghost-btn">
        {loading ? <Loader2 className="spin" /> : <Eye />}
        Inspect Ghost Devices
      </button>
    );
  }

  const grouped: Record<string, GhostDevice[]> = {};
  for (const g of ghosts) { const c = g.class || "Other"; (grouped[c] ??= []).push(g); }
  const classes = Object.keys(grouped).sort();
  const filtered = filter ? { [filter]: grouped[filter] || [] } : grouped;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 8 }}>
        <div className="flex-center gap-sm">
          <Ghost style={{ width: 14, height: 14, color: "var(--text-dim)" }} />
          <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{ghosts.length} ghost devices</span>
        </div>
        <button onClick={() => setGhosts(null)} style={{ background: "none", border: "none", fontSize: 10, color: "var(--text-dim)", cursor: "pointer" }}>close</button>
      </div>

      <div className="ghost-filters">
        <button onClick={() => setFilter(null)} className={`ghost-filter ${filter === null ? "ghost-filter--active" : ""}`}>All</button>
        {classes.map((c) => (
          <button key={c} onClick={() => setFilter(filter === c ? null : c)} className={`ghost-filter ${filter === c ? "ghost-filter--active" : ""}`}>
            {c} ({grouped[c].length})
          </button>
        ))}
      </div>

      <div className="ghost-list">
        {Object.entries(filtered).map(([cls, devices]) => (
          <div key={cls}>
            {!filter && <div className="ghost-class-header">{cls}</div>}
            {devices.map((d) => {
              const Icon = classIcons[cls] || HardDrive;
              return (
                <div key={d.instance_id} className="ghost-item">
                  <Icon /> <span className="truncate">{d.name}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
