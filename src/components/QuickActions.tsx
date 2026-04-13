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
    } catch {
      setResult({ action: label, success: false });
    } finally {
      setRunning(null);
      setTimeout(() => setResult(null), 4000);
    }
  }

  const actions = [
    {
      key: "fix_cameras" as ActionKey,
      label: "Fix Cameras",
      icon: Camera,
      color: "bg-accent/20 text-accent hover:bg-accent/30",
    },
    {
      key: "reset_usb" as ActionKey,
      label: "Reset USB",
      icon: Usb,
      color: "bg-blue-500/15 text-blue-400 hover:bg-blue-500/25",
    },
    {
      key: "clean_ghosts" as ActionKey,
      label: `Clean Ghosts${ghostStats ? ` (${ghostStats.total})` : ""}`,
      icon: Trash2,
      color: "bg-warning/15 text-warning hover:bg-warning/25",
    },
  ];

  return (
    <div className="border-t border-border px-6 py-3.5">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-muted/40 shrink-0">
          <Shield className="w-3 h-3" />
          <span className="text-[10px]">UAC</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions.map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => runAction(key, label)}
              disabled={running !== null}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium transition-all ${
                running === key
                  ? "bg-zinc-800 text-muted cursor-wait"
                  : running !== null
                    ? "opacity-30 cursor-not-allowed bg-transparent text-muted"
                    : color
              }`}
            >
              {running === key ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Icon className="w-3.5 h-3.5" />
              )}
              {label}
            </button>
          ))}
        </div>
        {result && (
          <span className={`text-[11px] ${result.success ? "text-ok" : "text-error"}`}>
            {result.success ? `${result.action} done` : `${result.action} failed`}
          </span>
        )}
      </div>
    </div>
  );
}
