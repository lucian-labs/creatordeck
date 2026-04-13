import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Usb,
  Ghost,
  AlertTriangle,
  HardDrive,
  RotateCw,
  Loader2,
  Info,
} from "lucide-react";
import type { DeviceInfo, GhostStats } from "../types";
import { StatusBadge } from "./StatusBadge";
import { GhostViewer } from "./GhostViewer";

interface UsbHealthPanelProps {
  usbDevices: DeviceInfo[];
  ghostStats: GhostStats | null;
}

function UsbDeviceRow({ device, onReset }: { device: DeviceInfo; onReset: () => void }) {
  const [resetting, setResetting] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const isBad = device.Status !== "OK";

  async function handleReset() {
    setResetting(true);
    try {
      await invoke("reset_device", { instanceId: device.InstanceId });
      onReset();
    } catch {
      // ignore
    } finally {
      setResetting(false);
    }
  }

  async function showDetail() {
    try {
      const raw = await invoke<string>("get_device_detail", {
        instanceId: device.InstanceId,
      });
      setDetail(detail ? null : raw);
    } catch {
      setDetail("Could not fetch details");
    }
  }

  return (
    <div className={`border-b border-border/30 px-5 py-3.5 text-xs ${isBad ? "bg-red-950/10" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate flex-1">{device.FriendlyName || "Unknown"}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <StatusBadge status={device.Status} present={device.Present} />
          {isBad && (
            <>
              <button
                onClick={showDetail}
                className="p-1 text-zinc-500 hover:text-white transition-colors"
                title="Device details"
              >
                <Info className="w-3 h-3" />
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="p-1 text-warning hover:text-amber-300 transition-colors"
                title="Reset this device (UAC)"
              >
                {resetting ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RotateCw className="w-3 h-3" />
                )}
              </button>
            </>
          )}
        </div>
      </div>
      {detail && (
        <pre className="mt-2 text-[10px] text-muted bg-black/20 p-3 overflow-x-auto whitespace-pre-wrap">
          {detail}
        </pre>
      )}
    </div>
  );
}

export function UsbHealthPanel({ usbDevices, ghostStats }: UsbHealthPanelProps) {
  const [, setTick] = useState(0);
  const erroredCount = usbDevices.filter((d) => d.Status !== "OK").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Usb className="w-4 h-4 text-muted" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
          USB Health
        </h2>
      </div>

      {/* Controllers */}
      <div className="space-y-1">
        <p className="text-[11px] text-muted/60 flex items-center gap-1.5 px-4">
          <HardDrive className="w-3 h-3" />
          Controllers & Hubs
          {erroredCount > 0 && (
            <span className="text-error font-medium">
              ({erroredCount} failing)
            </span>
          )}
        </p>
        <div>
          {usbDevices.map((d) => (
            <UsbDeviceRow
              key={d.InstanceId}
              device={d}
              onReset={() => setTick((t) => t + 1)}
            />
          ))}
          {usbDevices.length === 0 && (
            <p className="text-xs text-muted italic px-4 py-2">No USB controllers detected</p>
          )}
        </div>
      </div>

      {/* Ghost Stats */}
      {ghostStats && (
        <div className="space-y-3 px-4">
          <p className="text-[11px] text-muted/60 flex items-center gap-1.5">
            <Ghost className="w-3 h-3" />
            Ghost Devices
          </p>
          <div className="grid grid-cols-4 gap-px bg-border/30">
            {[
              { label: "Cam", value: ghostStats.camera, warn: ghostStats.camera > 0 },
              { label: "Audio", value: ghostStats.audio, warn: ghostStats.audio > 10 },
              { label: "USB", value: ghostStats.usb, warn: ghostStats.usb > 20 },
              { label: "Total", value: ghostStats.total, warn: ghostStats.total > 100 },
            ].map(({ label, value, warn }) => (
              <div key={label} className="bg-surface-raised px-3 py-2.5 text-center">
                <p className={`text-base font-bold ${warn ? "text-warning" : "text-zinc-400"}`}>
                  {value}
                </p>
                <p className="text-[10px] text-muted/50 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
          {ghostStats.total > 50 && (
            <div className="flex items-start gap-2.5 px-1 py-2">
              <AlertTriangle className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />
              <p className="text-[11px] text-muted/70">
                {ghostStats.total} ghost devices. Inspect before cleaning.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="px-4">
        <GhostViewer />
      </div>
    </div>
  );
}
