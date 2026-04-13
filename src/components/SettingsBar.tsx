import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Power } from "lucide-react";

export function SettingsBar() {
  const [autostart, setAutostart] = useState(false);

  useEffect(() => {
    invoke<boolean>("plugin:autostart|is_enabled").then(setAutostart).catch(() => {});
  }, []);

  async function toggle() {
    try {
      await invoke(autostart ? "plugin:autostart|disable" : "plugin:autostart|enable");
      setAutostart(!autostart);
    } catch {}
  }

  return (
    <div className="settings-bar">
      <button onClick={toggle} className={`autostart-btn ${autostart ? "autostart-btn--on" : "autostart-btn--off"}`}>
        <Power /> {autostart ? "Autostart: On" : "Autostart: Off"}
      </button>
      {autostart && <span className="settings-hint">Starts with Windows</span>}
    </div>
  );
}
