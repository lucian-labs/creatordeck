import { Activity, Camera, Mic, Film, Clapperboard } from "lucide-react";
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
  "obs-browser-page": "OBS Browser",
};

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  Camera: { icon: Camera, color: "bg-red-900/40 text-red-300" },
  "Camera/Audio": { icon: Camera, color: "bg-orange-900/40 text-orange-300" },
  Audio: { icon: Mic, color: "bg-blue-900/40 text-blue-300" },
  "Media Read/Write": { icon: Film, color: "bg-purple-900/40 text-purple-300" },
  "Media Framework": { icon: Clapperboard, color: "bg-zinc-800 text-zinc-400" },
};

export function ProcessList({ processes }: ProcessListProps) {
  // Sort: camera/audio first, media framework last
  const sorted = [...processes].sort((a, b) => {
    const aHasCam = a.media_types.some((t) => t.includes("Camera"));
    const bHasCam = b.media_types.some((t) => t.includes("Camera"));
    if (aHasCam !== bHasCam) return aHasCam ? -1 : 1;
    const aHasAudio = a.media_types.includes("Audio");
    const bHasAudio = b.media_types.includes("Audio");
    if (aHasAudio !== bHasAudio) return aHasAudio ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

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

      <div className="space-y-1.5 max-h-72 overflow-y-auto">
        {sorted.map((p) => {
          const friendly = knownApps[p.name] || p.name;
          return (
            <div
              key={`${p.id}-${p.name}`}
              className="rounded-lg px-3 py-2 bg-zinc-900/50 hover:bg-surface-hover transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{friendly}</p>
                  {p.title && (
                    <p className="text-[10px] text-muted truncate">{p.title}</p>
                  )}
                </div>
                <span className="text-[10px] text-muted font-mono shrink-0">
                  {p.id}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {p.media_types.map((type_) => {
                  const cfg = typeConfig[type_] || typeConfig["Media Framework"];
                  const Icon = cfg.icon;
                  return (
                    <span
                      key={type_}
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${cfg.color}`}
                    >
                      <Icon className="w-2.5 h-2.5" />
                      {type_}
                    </span>
                  );
                })}
              </div>
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
