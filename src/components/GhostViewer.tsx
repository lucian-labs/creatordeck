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
        className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 py-3 text-xs text-muted hover:text-white hover:border-zinc-500 transition-colors"
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

  // Group by class
  const grouped: Record<string, GhostDevice[]> = {};
  for (const g of ghosts) {
    const cls = g.class || "Other";
    if (!grouped[cls]) grouped[cls] = [];
    grouped[cls].push(g);
  }

  const classes = Object.keys(grouped).sort();
  const filtered = filter ? { [filter]: grouped[filter] || [] } : grouped;

  return (
    <div className="rounded-xl border border-border bg-surface-raised p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ghost className="w-4 h-4 text-muted" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Ghost Devices
          </h2>
        </div>
        <span className="text-xs text-muted">{ghosts.length} total</span>
      </div>

      {/* Class filter chips */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter(null)}
          className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
            filter === null ? "bg-accent text-white" : "bg-zinc-800 text-muted hover:text-white"
          }`}
        >
          All ({ghosts.length})
        </button>
        {classes.map((cls) => (
          <button
            key={cls}
            onClick={() => setFilter(filter === cls ? null : cls)}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
              filter === cls ? "bg-accent text-white" : "bg-zinc-800 text-muted hover:text-white"
            }`}
          >
            {cls} ({grouped[cls].length})
          </button>
        ))}
      </div>

      {/* Device list */}
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {Object.entries(filtered).map(([cls, devices]) => (
          <div key={cls}>
            {!filter && (
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-2 mb-1 first:mt-0">
                {cls} ({devices.length})
              </p>
            )}
            {devices.map((d) => {
              const Icon = classIcons[cls] || HardDrive;
              return (
                <div
                  key={d.instance_id}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 bg-zinc-900/50 hover:bg-surface-hover transition-colors"
                >
                  <Icon className="w-3 h-3 text-zinc-600 shrink-0" />
                  <span className="text-xs truncate">{d.name}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <button
        onClick={() => setGhosts(null)}
        className="text-[10px] text-muted hover:text-white transition-colors"
      >
        Close viewer
      </button>
    </div>
  );
}
