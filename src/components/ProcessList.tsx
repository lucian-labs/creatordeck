import { Activity, Camera, Mic, Film, Clapperboard } from "lucide-react";
import type { ProcessInfo } from "../types";

interface ProcessListProps {
  processes: ProcessInfo[];
}

const knownApps: Record<string, string> = {
  obs64: "OBS Studio", obs: "OBS Studio", chrome: "Chrome", firefox: "Firefox",
  msedge: "Edge", discord: "Discord", Zoom: "Zoom", Teams: "Teams",
  Telegram: "Telegram", "OVRServer_x64": "Oculus VR", GameBar: "Game Bar",
  explorer: "Explorer", claude: "Claude", "obs-browser-page": "OBS Browser",
};

const tagMap: Record<string, { icon: React.ElementType; cls: string }> = {
  Camera: { icon: Camera, cls: "tag--camera" },
  "Camera/Audio": { icon: Camera, cls: "tag--camera-audio" },
  Audio: { icon: Mic, cls: "tag--audio" },
  "Media Read/Write": { icon: Film, cls: "tag--media-rw" },
  "Media Framework": { icon: Clapperboard, cls: "tag--media-fw" },
};

export function ProcessList({ processes }: ProcessListProps) {
  const sorted = [...processes].sort((a, b) => {
    const ac = a.media_types.some((t) => t.includes("Camera"));
    const bc = b.media_types.some((t) => t.includes("Camera"));
    if (ac !== bc) return ac ? -1 : 1;
    const aa = a.media_types.includes("Audio");
    const ba = b.media_types.includes("Audio");
    if (aa !== ba) return aa ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div>
      <div className="flex-between">
        <div className="section-header">
          <Activity />
          <span className="section-title">What's Using What</span>
        </div>
        <span className="section-count">{processes.length} processes</span>
      </div>

      {sorted.map((p) => {
        const friendly = knownApps[p.name] || p.name;
        return (
          <div key={`${p.id}-${p.name}`} className="row">
            <div className="row-info">
              <div className="row-name">{friendly}</div>
              {p.title && <div className="row-sub">{p.title}</div>}
              <div className="tags">
                {p.media_types.map((t) => {
                  const cfg = tagMap[t] || tagMap["Media Framework"];
                  const Icon = cfg.icon;
                  return (
                    <span key={t} className={`tag ${cfg.cls}`}>
                      <Icon /> {t}
                    </span>
                  );
                })}
              </div>
            </div>
            <span className="row-id">{p.id}</span>
          </div>
        );
      })}

      {processes.length === 0 && (
        <div className="row-sub" style={{ padding: "24px 20px" }}>No media processes detected</div>
      )}
    </div>
  );
}
