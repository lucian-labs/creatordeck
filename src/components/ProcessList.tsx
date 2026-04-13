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
  Camera: { icon: Camera, color: "bg-red-900/30 text-red-300 border border-red-800/20" },
  "Camera/Audio": { icon: Camera, color: "bg-orange-900/30 text-orange-300 border border-orange-800/20" },
  Audio: { icon: Mic, color: "bg-blue-900/30 text-blue-300 border border-blue-800/20" },
  "Media Read/Write": { icon: Film, color: "bg-purple-900/30 text-purple-300 border border-purple-800/20" },
  "Media Framework": { icon: Clapperboard, color: "bg-zinc-800/50 text-zinc-400 border border-zinc-700/20" },
};

export function ProcessList({ processes }: ProcessListProps) {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-muted" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
            What's Using What
          </h2>
        </div>
        <span className="text-xs text-muted/60">{processes.length} processes</span>
      </div>

      <div className="space-y-px">
        {sorted.map((p) => {
          const friendly = knownApps[p.name] || p.name;
          return (
            <div
              key={`${p.id}-${p.name}`}
              className="border-b border-border/30 px-5 py-4 hover:bg-surface-hover transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{friendly}</p>
                  {p.title && (
                    <p className="text-xs text-muted/60 truncate mt-0.5">{p.title}</p>
                  )}
                </div>
                <span className="text-[10px] text-muted/50 font-mono shrink-0">
                  {p.id}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {p.media_types.map((type_) => {
                  const cfg = typeConfig[type_] || typeConfig["Media Framework"];
                  const Icon = cfg.icon;
                  return (
                    <span
                      key={type_}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium ${cfg.color}`}
                    >
                      <Icon className="w-3 h-3" />
                      {type_}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
        {processes.length === 0 && (
          <p className="text-sm text-muted italic py-6 px-4">No media processes detected</p>
        )}
      </div>
    </div>
  );
}
