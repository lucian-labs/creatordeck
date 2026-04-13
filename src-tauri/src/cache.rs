use crate::devices::{AllDeviceData, DeviceInfo, GhostStats};
use crate::powershell::run_ps;
use crate::processes::ProcessInfo;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Serialize, Clone, Debug, Default)]
pub struct CachedData {
    pub devices: Option<AllDeviceData>,
    pub ghost_stats: Option<GhostStats>,
    pub processes: Vec<ProcessInfo>,
    pub last_updated: String,
}

pub type AppCache = Mutex<CachedData>;

/// Called by background thread. Runs all PowerShell queries and updates the cache.
pub fn refresh_cache(cache: &AppCache) {
    // Fast query: devices only
    if let Ok(json) = run_ps(
        r#"
$cameras = @(Get-PnpDevice -Class Camera -EA SilentlyContinue | Select FriendlyName, Status, Present, InstanceId, Problem, Class)
$audio = @(Get-PnpDevice -Class AudioEndpoint -EA SilentlyContinue | Where { $_.Present } | Select FriendlyName, Status, Present, InstanceId, Problem, Class)
$usb = @(Get-PnpDevice -Class USB -PresentOnly -EA SilentlyContinue | Where { $_.FriendlyName -match 'Host Controller|Root Hub' } | Select FriendlyName, Status, Present, InstanceId, Problem, Class)
@{ cameras = $cameras; audio_endpoints = $audio; usb_devices = $usb } | ConvertTo-Json -Depth 3 -Compress
"#,
    ) {
        if let Ok(data) = serde_json::from_str::<AllDeviceData>(&json) {
            if let Ok(mut c) = cache.lock() {
                c.devices = Some(data);
                c.last_updated = chrono::Local::now()
                    .format("%H:%M:%S")
                    .to_string();
            }
        }
    }

    // Process query
    if let Ok(json) = run_ps(
        r#"Get-Process -EA SilentlyContinue | Where-Object { $_.Modules -ne $null } | ForEach-Object { $p = $_; try { $mods = @($p.Modules.ModuleName); $types = @(); if ($mods -match 'avicap|vidcap|qcap') { $types += 'Camera' }; if ($mods -match 'ksproxy') { $types += 'Camera/Audio' }; if ($mods -match 'mmdevapi') { $types += 'Audio' }; if ($mods -match 'mfreadwrite') { $types += 'Media Read/Write' }; if ($mods -match 'mfplat' -and $types.Count -eq 0) { $types += 'Media Framework' }; if ($types.Count -gt 0) { [PSCustomObject]@{ id = $p.Id; name = $p.ProcessName; title = $p.MainWindowTitle; media_types = $types } } } catch {} } | Sort-Object name -Unique | ConvertTo-Json -Depth 3 -Compress"#
    ) {
        let procs: Vec<ProcessInfo> = if json.is_empty() || json == "null" {
            vec![]
        } else if json.starts_with('[') {
            serde_json::from_str(&json).unwrap_or_default()
        } else {
            serde_json::from_str::<ProcessInfo>(&json)
                .map(|p| vec![p])
                .unwrap_or_default()
        };
        if let Ok(mut c) = cache.lock() {
            c.processes = procs;
        }
    }
}

/// Slower ghost count query — run less frequently.
pub fn refresh_ghost_stats(cache: &AppCache) {
    if let Ok(json) = run_ps(
        "@{ camera = @(Get-PnpDevice -Class Camera -EA SilentlyContinue | Where { -not $_.Present }).Count; audio = @(Get-PnpDevice -Class AudioEndpoint -EA SilentlyContinue | Where { -not $_.Present }).Count; usb = @(Get-PnpDevice -Class USB -EA SilentlyContinue | Where { -not $_.Present }).Count; total = @(Get-PnpDevice -EA SilentlyContinue | Where { -not $_.Present }).Count } | ConvertTo-Json -Compress"
    ) {
        if let Ok(stats) = serde_json::from_str::<GhostStats>(&json) {
            if let Ok(mut c) = cache.lock() {
                c.ghost_stats = Some(stats);
            }
        }
    }
}

// --- Tauri commands that read from cache instantly ---

#[tauri::command]
pub fn get_cached_data(cache: tauri::State<'_, AppCache>) -> Result<CachedData, String> {
    let c = cache.lock().map_err(|e| format!("Lock: {}", e))?;
    Ok(c.clone())
}
