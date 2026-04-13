export interface DeviceInfo {
  FriendlyName: string | null;
  Status: "OK" | "Error" | "Unknown" | "Degraded";
  Present: boolean;
  InstanceId: string;
  Problem: number | null;
  Class: string | null;
}

export interface GhostStats {
  camera: number;
  audio: number;
  usb: number;
  total: number;
}

export interface ProcessInfo {
  Id: number;
  ProcessName: string;
  MainWindowTitle: string | null;
}

export type DeviceCategory = "camera" | "audio" | "usb";

export interface GhostDevice {
  name: string;
  class: string;
  instance_id: string;
}

export interface TimelineEvent {
  timestamp: string;
  device_name: string;
  device_class: string;
  event_type: "connected" | "disconnected" | "error" | "recovered" | "changed";
  detail: string;
}
