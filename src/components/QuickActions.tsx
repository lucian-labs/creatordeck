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
    try { await invoke(action); setResult({ action: label, success: true }); setTimeout(onActionComplete, 1000); }
    catch { setResult({ action: label, success: false }); }
    finally { setRunning(null); setTimeout(() => setResult(null), 4000); }
  }

  const actions: { key: ActionKey; label: string; icon: React.ElementType; cls: string }[] = [
    { key: "fix_cameras", label: "Fix Cameras", icon: Camera, cls: "action-btn--accent" },
    { key: "reset_usb", label: "Reset USB", icon: Usb, cls: "action-btn--blue" },
    { key: "clean_ghosts", label: `Clean Ghosts${ghostStats ? ` (${ghostStats.total})` : ""}`, icon: Trash2, cls: "action-btn--warning" },
  ];

  return (
    <div className="quick-actions">
      <div className="quick-actions-label">
        <Shield /><span>UAC</span>
      </div>
      <div className="action-buttons">
        {actions.map(({ key, label, icon: Icon, cls }) => (
          <button
            key={key}
            onClick={() => runAction(key, label)}
            disabled={running !== null}
            className={`action-btn ${running === key ? "action-btn--loading" : running ? "" : cls}`}
          >
            {running === key ? <Loader2 className="spin" /> : <Icon />}
            {label}
          </button>
        ))}
      </div>
      {result && (
        <span className={`action-result ${result.success ? "action-result--ok" : "action-result--fail"}`}>
          {result.success ? `${result.action} done` : `${result.action} failed`}
        </span>
      )}
    </div>
  );
}
