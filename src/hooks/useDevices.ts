import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { DeviceInfo, GhostStats, ProcessInfo } from "../types";

interface CachedData {
  devices: {
    cameras: DeviceInfo[];
    audio_endpoints: DeviceInfo[];
    usb_devices: DeviceInfo[];
  } | null;
  ghost_stats: GhostStats | null;
  processes: ProcessInfo[];
  last_updated: string;
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
      // Single instant read from Rust cache — no PowerShell spawning
      const data = await invoke<CachedData>("get_cached_data");

      if (mountedRef.current) {
        setState({
          cameras: data.devices?.cameras ?? [],
          audioEndpoints: data.devices?.audio_endpoints ?? [],
          usbDevices: data.devices?.usb_devices ?? [],
          ghostStats: data.ghost_stats,
          mediaProcesses: data.processes,
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
    // Poll cache every 2s — this is instant since it just reads memory
    const interval = setInterval(refresh, 2000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [refresh]);

  return { ...state, refresh };
}
