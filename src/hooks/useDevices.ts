import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { DeviceInfo, GhostStats, ProcessInfo } from "../types";

interface AllDeviceData {
  cameras: DeviceInfo[];
  audio_endpoints: DeviceInfo[];
  usb_devices: DeviceInfo[];
  ghost_stats: GhostStats;
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

export function useDevices(pollInterval = 8000) {
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
      // Single consolidated PowerShell call for all device data
      // + separate call for processes (different query type)
      const [deviceData, mediaProcesses] = await Promise.all([
        invoke<AllDeviceData>("get_all_devices").catch(() => null),
        invoke<ProcessInfo[]>("get_media_processes").catch(() => []),
      ]);

      if (mountedRef.current) {
        setState({
          cameras: deviceData?.cameras ?? [],
          audioEndpoints: deviceData?.audio_endpoints ?? [],
          usbDevices: deviceData?.usb_devices ?? [],
          ghostStats: deviceData?.ghost_stats ?? null,
          mediaProcesses,
          loading: false,
          lastRefresh: new Date(),
        });
      }
    } catch {
      if (mountedRef.current) {
        setState((s) => ({ ...s, loading: false }));
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    const interval = setInterval(refresh, pollInterval);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [refresh, pollInterval]);

  return { ...state, refresh };
}
