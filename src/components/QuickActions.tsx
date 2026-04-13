import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Camera, Usb, Trash2, Loader2, Shield } from "lucide-react";
import type { GhostStats } from "../types";

interface QuickActionsProps {
  ghostStats: GhostStats | null;
  onActionComplete: () => void;
}

type ActionKey = "fix_cameras" | "reset_usb" | "clean_ghosts";

export function QuickActions({ ghostStats, onActionComplete }: QuickActionsProps) {
  const [running, setRunning] = useState<ActionKey | null>(null);
  const [result, setResult] = useState<{ action: string; success: boolean } | null>(null);

  async function runAction(action: ActionKey, label: string) {
    setRunning(action);
    setResult(null);
    try {
      await invoke(action);
      setResult({ action: label, success: true });
      setTimeout(() => onActionComplete(), 1000);
    } catch (e) {
      setResult({ action: label, success: false });
    } finally {
      setRunning(null);
      setTimeout(() => setResult(null), 4000);
    }
  }

  const actions = [
    {
      key: "fix_cameras" as ActionKey,
      label: "Fix My Cameras",
      icon: Camera,
      description: "Reset camera devices & restart Frame Server",
      color: "bg-accent hover:bg-accent-hover",
    },
    {
      key: "reset_usb" as ActionKey,
      label: "Reset USB",
      icon: Usb,
      description: "Restart USB controllers & root hubs",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      key: "clean_ghosts" as ActionKey,
      label: `Clean Ghosts${ghostStats ? ` (${ghostStats.total})` : ""}`,
      icon: Trash2,
      description: "Remove stale device entries",
      color: "bg-amber-600 hover:bg-amber-700",
    },
  ];

  return (
    <div className="border-t border-border bg-surface-raised/80 backdrop-blur px-6 py-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-3.5 h-3.5 text-muted" />
        <p className="text-xs text-muted">
          Quick actions require admin privileges (UAC prompt)
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {actions.map(({ key, label, icon: Icon, description, color }) => (
          <button
            key={key}
            onClick={() => runAction(key, label)}
            disabled={running !== null}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all ${
              running === key
                ? "bg-zinc-700 cursor-wait"
                : running !== null
                  ? "bg-zinc-800 opacity-50 cursor-not-allowed"
                  : color
            }`}
            title={description}
          >
            {running === key ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Icon className="w-4 h-4" />
            )}
            {label}
          </button>
        ))}
      </div>
      {result && (
        <p className={`mt-2 text-xs ${result.success ? "text-ok" : "text-error"}`}>
          {result.success
            ? `${result.action} completed. Refreshing...`
            : `${result.action} failed or was cancelled.`}
        </p>
      )}
    </div>
  );
}
