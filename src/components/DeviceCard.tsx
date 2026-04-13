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
      className={`relative rounded-xl border p-4 transition-all ${
        isGhost
          ? "border-zinc-800 bg-zinc-900/40 opacity-50"
          : isBad
            ? "border-red-800/40 bg-red-950/20"
            : "border-border bg-surface-raised hover:bg-surface-hover hover:border-zinc-600/50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`mt-0.5 rounded-lg p-2 ${
              isGhost
                ? "bg-zinc-800"
                : isBad
                  ? "bg-red-950/50"
                  : "bg-accent/10"
            }`}
          >
            {isGhost ? (
              <Ghost className="w-4 h-4 text-zinc-500" />
            ) : (
              <Icon className={`w-4 h-4 ${isBad ? "text-red-400" : "text-accent"}`} />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{name}</p>
            <p className="text-xs text-muted truncate mt-0.5">
              {device.InstanceId.split("\\").slice(0, 2).join("\\")}
            </p>
          </div>
        </div>
        <StatusBadge status={device.Status} present={device.Present} />
      </div>
    </div>
  );
}
