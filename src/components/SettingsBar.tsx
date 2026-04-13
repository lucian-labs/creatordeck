import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Power } from "lucide-react";

export function SettingsBar() {
  const [autostart, setAutostart] = useState(false);

  useEffect(() => {
    invoke<boolean>("plugin:autostart|is_enabled")
      .then(setAutostart)
      .catch(() => {});
  }, []);

  async function toggleAutostart() {
    try {
      if (autostart) {
        await invoke("plugin:autostart|disable");
        setAutostart(false);
      } else {
        await invoke("plugin:autostart|enable");
        setAutostart(true);
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex items-center gap-3 px-6 py-2.5 border-t border-border/50">
      <button
        onClick={toggleAutostart}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] transition-colors ${
          autostart
            ? "bg-accent/15 text-accent"
            : "text-muted/50 hover:text-muted"
        }`}
      >
        <Power className="w-3 h-3" />
        {autostart ? "Autostart: On" : "Autostart: Off"}
      </button>
      <span className="text-[10px] text-muted/30">
        {autostart ? "Starts with Windows" : ""}
      </span>
    </div>
  );
}
