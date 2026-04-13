import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { DeviceInfo, GhostStats, ProcessInfo } from "../types";

interface AllDeviceData {
  cameras: DeviceInfo[];
  audio_endpoints: DeviceInfo[];
  usb_devices: DeviceInfo[];
}

interface DeviceState {
  cameras: DeviceInfo[];
  audioEndpoints: DeviceInfo[];
  usbDevices: DeviceInfo[];
  ghostStats: GhostStats | null;
  mediaProcesses: ProcessInfo[];
  loading: boolean;
  lastRefresh: Date | null;
}

export function useDevices() {
  const [state, setState] = useState<DeviceState>({
    cameras: [],
    audioEndpoints: [],
    usbDevices: [],
    ghostStats: null,
    mediaProcesses: [],
    loading: true,
    lastRefresh: null,
  });

  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    try {
      // Lightweight device poll — no ghost scanning
      const deviceData = await invoke<AllDeviceData>("get_all_devices").catch(() => null);

      if (mountedRef.current && deviceData) {
        setState((prev) => ({
          ...prev,
          cameras: deviceData.cameras,
          audioEndpoints: deviceData.audio_endpoints,
          usbDevices: deviceData.usb_devices,
          loading: false,
          lastRefresh: new Date(),
        }));
      }
    } catch {
      if (mountedRef.current) {
        setState((s) => ({ ...s, loading: false }));
      }
    }
  }, []);

  // Separate slow queries on longer intervals
  const refreshSlow = useCallback(async () => {
    try {
      const [ghostStats, mediaProcesses] = await Promise.all([
        invoke<GhostStats>("get_ghost_count").catch(() => null),
        invoke<ProcessInfo[]>("get_media_processes").catch(() => []),
      ]);
      if (mountedRef.current) {
        setState((prev) => ({
          ...prev,
          ghostStats: ghostStats ?? prev.ghostStats,
          mediaProcesses,
        }));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    refreshSlow();

    // Fast poll: devices only (every 8s)
    const fastInterval = setInterval(refresh, 8000);

    // Slow poll: ghost count + processes (every 30s)
    const slowInterval = setInterval(refreshSlow, 30000);

    return () => {
      mountedRef.current = false;
      clearInterval(fastInterval);
      clearInterval(slowInterval);
    };
  }, [refresh, refreshSlow]);

  const fullRefresh = useCallback(async () => {
    await Promise.all([refresh(), refreshSlow()]);
  }, [refresh, refreshSlow]);

  return { ...state, refresh: fullRefresh };
}
