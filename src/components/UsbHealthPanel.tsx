import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Usb, Ghost, AlertTriangle, HardDrive, RotateCw, Loader2, Info } from "lucide-react";
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
    try { await invoke("reset_device", { instanceId: device.InstanceId }); onReset(); }
    catch {} finally { setResetting(false); }
  }

  async function toggleDetail() {
    if (detail) { setDetail(null); return; }
    try { setDetail(await invoke<string>("get_device_detail", { instanceId: device.InstanceId })); }
    catch { setDetail("Could not fetch details"); }
  }

  return (
    <div className={`row ${isBad ? "row-bad" : ""}`} style={{ padding: "12px 20px", fontSize: 12 }}>
      <span className="truncate" style={{ flex: 1 }}>{device.FriendlyName || "Unknown"}</span>
      <div className="usb-actions">
        <StatusBadge status={device.Status} present={device.Present} />
        {isBad && (
          <>
            <button onClick={toggleDetail} title="Details"><Info /></button>
            <button onClick={handleReset} disabled={resetting} title="Reset (UAC)" style={{ color: "var(--warning)" }}>
              {resetting ? <Loader2 className="spin" /> : <RotateCw />}
            </button>
          </>
        )}
      </div>
      {detail && <pre className="usb-detail">{detail}</pre>}
    </div>
  );
}

export function UsbHealthPanel({ usbDevices, ghostStats }: UsbHealthPanelProps) {
  const [, setTick] = useState(0);
  const erroredCount = usbDevices.filter((d) => d.Status !== "OK").length;

  return (
    <div>
      <div className="section-header">
        <Usb />
        <span className="section-title">USB Health</span>
      </div>

      <div style={{ marginTop: 8 }}>
        <div className="section-header" style={{ paddingLeft: 20 }}>
          <HardDrive style={{ width: 12, height: 12 }} />
          <span className="section-count">
            Controllers & Hubs
            {erroredCount > 0 && <span style={{ color: "var(--error)", fontWeight: 500 }}> ({erroredCount} failing)</span>}
          </span>
        </div>
        {usbDevices.map((d) => (
          <UsbDeviceRow key={d.InstanceId} device={d} onReset={() => setTick((t) => t + 1)} />
        ))}
        {usbDevices.length === 0 && <div className="row-sub" style={{ padding: "8px 20px" }}>No USB controllers detected</div>}
      </div>

      {ghostStats && (
        <div style={{ marginTop: 24 }}>
          <div className="section-header" style={{ paddingLeft: 20 }}>
            <Ghost style={{ width: 12, height: 12 }} />
            <span className="section-count">Ghost Devices</span>
          </div>
          <div className="ghost-grid" style={{ margin: "8px 20px 0" }}>
            {[
              { label: "Cam", value: ghostStats.camera, warn: ghostStats.camera > 0 },
              { label: "Audio", value: ghostStats.audio, warn: ghostStats.audio > 10 },
              { label: "USB", value: ghostStats.usb, warn: ghostStats.usb > 20 },
              { label: "Total", value: ghostStats.total, warn: ghostStats.total > 100 },
            ].map(({ label, value, warn }) => (
              <div key={label} className="ghost-stat">
                <div className={`ghost-stat-value ${warn ? "ghost-stat-value--warn" : ""}`}>{value}</div>
                <div className="ghost-stat-label">{label}</div>
              </div>
            ))}
          </div>
          {ghostStats.total > 50 && (
            <div className="alert" style={{ padding: "8px 20px" }}>
              <AlertTriangle />
              <p>{ghostStats.total} ghost devices. Inspect before cleaning.</p>
            </div>
          )}
        </div>
      )}

      <div style={{ padding: "16px 20px 0" }}>
        <GhostViewer />
      </div>
    </div>
  );
}
