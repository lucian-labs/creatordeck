import { Camera, Mic, Usb, Ghost } from "lucide-react";
import type { DeviceInfo, DeviceCategory } from "../types";
import { StatusBadge } from "./StatusBadge";

interface DeviceCardProps {
  device: DeviceInfo;
  category: DeviceCategory;
}

const icons = {
  camera: Camera,
  audio: Mic,
  usb: Usb,
};

export function DeviceCard({ device, category }: DeviceCardProps) {
  const Icon = icons[category];
  const name = device.FriendlyName || "Unknown Device";
  const isGhost = !device.Present;
  const isBad = device.Status !== "OK";

  return (
    <div
      className={`border-b border-border/50 px-4 py-3.5 transition-all ${
        isGhost
          ? "opacity-40"
          : isBad
            ? "bg-red-950/10"
            : "hover:bg-surface-hover"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5 p-1.5">
            {isGhost ? (
              <Ghost className="w-4 h-4 text-zinc-600" />
            ) : (
              <Icon className={`w-4 h-4 ${isBad ? "text-error" : "text-accent"}`} />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{name}</p>
            <p className="text-xs text-muted/60 truncate mt-0.5">
              {device.InstanceId.split("\\").slice(0, 2).join("\\")}
            </p>
          </div>
        </div>
        <StatusBadge status={device.Status} present={device.Present} />
      </div>
    </div>
  );
}
