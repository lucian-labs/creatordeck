import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { DeviceInfo, GhostStats, ProcessInfo } from "../types";

interface DeviceState {
  cameras: DeviceInfo[];
  audioEndpoints: DeviceInfo[];
  usbDevices: DeviceInfo[];
  ghostStats: GhostStats | null;
  mediaProcesses: ProcessInfo[];
  loading: boolean;
  lastRefresh: Date | null;
}

export function useDevices(pollInterval = 5000) {
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
      const [cameras, audioEndpoints, usbDevices, ghostStats, mediaProcesses] =
        await Promise.all([
          invoke<DeviceInfo[]>("get_cameras").catch(() => []),
          invoke<DeviceInfo[]>("get_audio_endpoints").catch(() => []),
          invoke<DeviceInfo[]>("get_usb_devices").catch(() => []),
          invoke<GhostStats>("get_ghost_count").catch(() => null),
          invoke<ProcessInfo[]>("get_media_processes").catch(() => []),
        ]);

      if (mountedRef.current) {
        setState({
          cameras,
          audioEndpoints,
          usbDevices,
          ghostStats,
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
