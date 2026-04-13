import { Camera, Mic } from "lucide-react";
import type { DeviceInfo } from "../types";
import { DeviceCard } from "./DeviceCard";

interface DashboardProps {
  cameras: DeviceInfo[];
  audioEndpoints: DeviceInfo[];
  loading: boolean;
}

export function Dashboard({ cameras, audioEndpoints, loading }: DashboardProps) {
  if (loading) {
    return <div style={{ padding: 32, color: "var(--text-dim)", fontSize: 14 }}>Scanning devices...</div>;
  }

  const cameraOk = cameras.filter((d) => d.Status === "OK" && d.Present).length;
  const audioOk = audioEndpoints.filter((d) => d.Status === "OK" && d.Present).length;

  return (
    <div>
      <div className="section-header">
        <Camera />
        <span className="section-title">Cameras</span>
        <span className="section-count">{cameraOk}/{cameras.length} active</span>
      </div>
      {cameras.length === 0 ? (
        <div className="row-sub" style={{ padding: "8px 20px" }}>No camera devices found</div>
      ) : (
        cameras
          .sort((a, b) => (a.Present === b.Present ? 0 : a.Present ? -1 : 1))
          .map((d) => <DeviceCard key={d.InstanceId} device={d} category="camera" />)
      )}

      <div className="section-header" style={{ marginTop: 32 }}>
        <Mic />
        <span className="section-title">Audio Endpoints</span>
        <span className="section-count">{audioOk}/{audioEndpoints.length} active</span>
      </div>
      {audioEndpoints.length === 0 ? (
        <div className="row-sub" style={{ padding: "8px 20px" }}>No audio endpoints found</div>
      ) : (
        audioEndpoints
          .sort((a, b) => (a.Present === b.Present ? 0 : a.Present ? -1 : 1))
          .map((d) => <DeviceCard key={d.InstanceId} device={d} category="audio" />)
      )}
    </div>
  );
}
