import { Activity } from "lucide-react";
import type { ProcessInfo } from "../types";

interface ProcessListProps {
  processes: ProcessInfo[];
}

const knownApps: Record<string, string> = {
  obs64: "OBS Studio",
  obs: "OBS Studio",
  chrome: "Chrome",
  firefox: "Firefox",
  msedge: "Edge",
  discord: "Discord",
  Zoom: "Zoom",
  Teams: "Teams",
  Telegram: "Telegram",
  "OVRServer_x64": "Oculus VR",
  GameBar: "Game Bar",
  explorer: "Explorer",
  claude: "Claude",
};

export function ProcessList({ processes }: ProcessListProps) {
  return (
    <div className="rounded-xl border border-border bg-surface-raised p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-muted" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Media Processes
          </h2>
        </div>
        <span className="text-xs text-muted">{processes.length} active</span>
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto">
        {processes.map((p) => {
          const friendly = knownApps[p.ProcessName] || p.ProcessName;
          return (
            <div
              key={`${p.Id}-${p.ProcessName}`}
              className="flex items-center justify-between rounded-lg px-3 py-1.5 bg-zinc-900/50 hover:bg-surface-hover transition-colors"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{friendly}</p>
                {p.MainWindowTitle && (
                  <p className="text-[10px] text-muted truncate">{p.MainWindowTitle}</p>
                )}
              </div>
              <span className="text-[10px] text-muted font-mono ml-2 shrink-0">
                PID {p.Id}
              </span>
            </div>
          );
        })}
        {processes.length === 0 && (
          <p className="text-xs text-muted italic py-2">No media processes detected</p>
        )}
      </div>
    </div>
  );
}
