import { Usb, Ghost, AlertTriangle, HardDrive } from "lucide-react";
import type { DeviceInfo, GhostStats } from "../types";
import { StatusBadge } from "./StatusBadge";

interface UsbHealthPanelProps {
  usbDevices: DeviceInfo[];
  ghostStats: GhostStats | null;
}

export function UsbHealthPanel({ usbDevices, ghostStats }: UsbHealthPanelProps) {
  const controllers = usbDevices.filter(
    (d) => d.FriendlyName?.match(/Host Controller|Root Hub/i)
  );
  const erroredControllers = controllers.filter((d) => d.Status !== "OK");

  return (
    <div className="rounded-xl border border-border bg-surface-raised p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Usb className="w-4 h-4 text-muted" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          USB Health
        </h2>
      </div>

      {/* Controllers */}
      <div className="space-y-2">
        <p className="text-xs text-muted flex items-center gap-1.5">
          <HardDrive className="w-3 h-3" />
          Controllers & Hubs
          {erroredControllers.length > 0 && (
            <span className="text-red-400 font-medium">
              ({erroredControllers.length} failing)
            </span>
          )}
        </p>
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {controllers.map((d) => (
            <div
              key={d.InstanceId}
              className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs ${
                d.Status !== "OK"
                  ? "bg-red-950/30 border border-red-900/30"
                  : "bg-zinc-900/50"
              }`}
            >
              <span className="truncate mr-2">
                {d.FriendlyName || "Unknown"}
              </span>
              <StatusBadge status={d.Status} present={d.Present} />
            </div>
          ))}
          {controllers.length === 0 && (
            <p className="text-xs text-muted italic">No USB controllers detected</p>
          )}
        </div>
      </div>

      {/* Ghost Stats */}
      {ghostStats && (
        <div className="space-y-2">
          <p className="text-xs text-muted flex items-center gap-1.5">
            <Ghost className="w-3 h-3" />
            Ghost Devices
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Cameras", value: ghostStats.camera, warn: ghostStats.camera > 0 },
              { label: "Audio", value: ghostStats.audio, warn: ghostStats.audio > 10 },
              { label: "USB", value: ghostStats.usb, warn: ghostStats.usb > 20 },
              { label: "Total", value: ghostStats.total, warn: ghostStats.total > 100 },
            ].map(({ label, value, warn }) => (
              <div
                key={label}
                className={`rounded-lg px-3 py-2 text-center ${
                  warn ? "bg-amber-950/30 border border-amber-900/30" : "bg-zinc-900/50"
                }`}
              >
                <p className={`text-lg font-bold ${warn ? "text-warning" : "text-zinc-300"}`}>
                  {value}
                </p>
                <p className="text-[10px] text-muted uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
          {ghostStats.total > 50 && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-950/20 border border-amber-900/20 px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300/80">
                {ghostStats.total} ghost devices detected. Use "Clean Ghosts" to remove stale entries.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
