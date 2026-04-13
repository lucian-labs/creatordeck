import { Camera, Mic, Usb, Ghost } from "lucide-react";
import type { DeviceInfo, DeviceCategory } from "../types";
import { StatusBadge } from "./StatusBadge";

interface DeviceCardProps {
  device: DeviceInfo;
  category: DeviceCategory;
}

const icons = { camera: Camera, audio: Mic, usb: Usb };

export function DeviceCard({ device, category }: DeviceCardProps) {
  const Icon = icons[category];
  const name = device.FriendlyName || "Unknown Device";
  const isGhost = !device.Present;
  const isBad = device.Status !== "OK";

  return (
    <div className={`row ${isGhost ? "row-ghost" : ""} ${isBad && !isGhost ? "row-bad" : ""}`}>
      <div className={`device-icon ${isGhost ? "device-icon--ghost" : isBad ? "device-icon--error" : "device-icon--accent"}`}>
        {isGhost ? <Ghost /> : <Icon />}
      </div>
      <div className="row-info">
        <div className="row-name">{name}</div>
        <div className="row-sub">{device.InstanceId.split("\\").slice(0, 2).join("\\")}</div>
      </div>
      <StatusBadge status={device.Status} present={device.Present} />
    </div>
  );
}
