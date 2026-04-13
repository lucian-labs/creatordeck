import { Camera, Mic } from "lucide-react";
import type { DeviceInfo } from "../types";
import { DeviceCard } from "./DeviceCard";

interface DashboardProps {
  cameras: DeviceInfo[];
  audioEndpoints: DeviceInfo[];
  loading: boolean;
}

function SectionHeader({ icon: Icon, title, count, okCount }: {
  icon: React.ElementType;
  title: string;
  count: number;
  okCount: number;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-muted" />
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
        {title}
      </h2>
      <span className="text-xs text-muted">
        {okCount}/{count} active
      </span>
    </div>
  );
}

export function Dashboard({ cameras, audioEndpoints, loading }: DashboardProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted">
        <div className="animate-pulse">Scanning devices...</div>
      </div>
    );
  }

  const cameraOk = cameras.filter((d) => d.Status === "OK" && d.Present).length;
  const audioOk = audioEndpoints.filter((d) => d.Status === "OK" && d.Present).length;

  return (
    <div className="space-y-6">
      <div>
        <SectionHeader icon={Camera} title="Cameras" count={cameras.length} okCount={cameraOk} />
        {cameras.length === 0 ? (
          <p className="text-sm text-muted italic">No camera devices found</p>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {cameras
              .sort((a, b) => (a.Present === b.Present ? 0 : a.Present ? -1 : 1))
              .map((d) => (
                <DeviceCard key={d.InstanceId} device={d} category="camera" />
              ))}
          </div>
        )}
      </div>

      <div>
        <SectionHeader icon={Mic} title="Audio Endpoints" count={audioEndpoints.length} okCount={audioOk} />
        {audioEndpoints.length === 0 ? (
          <p className="text-sm text-muted italic">No audio endpoints found</p>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {audioEndpoints
              .sort((a, b) => (a.Present === b.Present ? 0 : a.Present ? -1 : 1))
              .map((d) => (
                <DeviceCard key={d.InstanceId} device={d} category="audio" />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
