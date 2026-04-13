import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Ghost, Eye, Loader2, Camera, Mic, Usb, Monitor, HardDrive } from "lucide-react";
import type { GhostDevice } from "../types";

const classIcons: Record<string, React.ElementType> = {
  Camera: Camera,
  AudioEndpoint: Mic,
  USB: Usb,
  Monitor: Monitor,
  HIDClass: HardDrive,
};

export function GhostViewer() {
  const [ghosts, setGhosts] = useState<GhostDevice[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);

  async function loadGhosts() {
    setLoading(true);
    try {
      const data = await invoke<GhostDevice[]>("get_ghost_devices");
      setGhosts(data);
    } catch {
      setGhosts([]);
    } finally {
      setLoading(false);
    }
  }

  if (ghosts === null) {
    return (
      <button
        onClick={loadGhosts}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 border border-dashed border-border py-3 text-xs text-muted/60 hover:text-muted hover:border-zinc-500 transition-colors"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Eye className="w-3.5 h-3.5" />
        )}
        Inspect Ghost Devices
      </button>
    );
  }

  const grouped: Record<string, GhostDevice[]> = {};
  for (const g of ghosts) {
    const cls = g.class || "Other";
    if (!grouped[cls]) grouped[cls] = [];
    grouped[cls].push(g);
  }

  const classes = Object.keys(grouped).sort();
  const filtered = filter ? { [filter]: grouped[filter] || [] } : grouped;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ghost className="w-3.5 h-3.5 text-muted/60" />
          <span className="text-[11px] text-muted/60">{ghosts.length} ghost devices</span>
        </div>
        <button
          onClick={() => setGhosts(null)}
          className="text-[10px] text-muted/40 hover:text-muted transition-colors"
        >
          close
        </button>
      </div>

      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => setFilter(null)}
          className={`px-2 py-0.5 text-[10px] transition-colors ${
            filter === null ? "bg-accent/20 text-accent" : "text-muted/40 hover:text-muted"
          }`}
        >
          All
        </button>
        {classes.map((cls) => (
          <button
            key={cls}
            onClick={() => setFilter(filter === cls ? null : cls)}
            className={`px-2 py-0.5 text-[10px] transition-colors ${
              filter === cls ? "bg-accent/20 text-accent" : "text-muted/40 hover:text-muted"
            }`}
          >
            {cls} ({grouped[cls].length})
          </button>
        ))}
      </div>

      <div className="max-h-48 overflow-y-auto">
        {Object.entries(filtered).map(([cls, devices]) => (
          <div key={cls}>
            {!filter && (
              <p className="text-[10px] text-muted/30 uppercase tracking-wider mt-3 mb-1 px-4 first:mt-0">
                {cls}
              </p>
            )}
            {devices.map((d) => {
              const Icon = classIcons[cls] || HardDrive;
              return (
                <div
                  key={d.instance_id}
                  className="flex items-center gap-2 px-4 py-1.5 border-b border-border/20 hover:bg-surface-hover transition-colors"
                >
                  <Icon className="w-3 h-3 text-zinc-600 shrink-0" />
                  <span className="text-[11px] truncate">{d.name}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
