use crate::powershell::run_ps;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DeviceInfo {
    #[serde(rename = "FriendlyName")]
    pub friendly_name: Option<String>,
    #[serde(rename = "Status")]
    pub status: String,
    #[serde(rename = "Present")]
    pub present: bool,
    #[serde(rename = "InstanceId")]
    pub instance_id: String,
    #[serde(rename = "Problem")]
    pub problem: Option<u32>,
    #[serde(rename = "Class")]
    pub class: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct GhostStats {
    pub camera: u32,
    pub audio: u32,
    pub usb: u32,
    pub total: u32,
}

fn parse_devices(json: &str) -> Result<Vec<DeviceInfo>, String> {
    if json.is_empty() || json == "null" {
        return Ok(vec![]);
    }
    // PowerShell returns a single object (not array) when there's only one result
    if json.starts_with('[') {
        serde_json::from_str(json).map_err(|e| format!("Parse error: {}", e))
    } else {
        let single: DeviceInfo =
            serde_json::from_str(json).map_err(|e| format!("Parse error: {}", e))?;
        Ok(vec![single])
    }
}

#[tauri::command]
pub fn get_cameras() -> Result<Vec<DeviceInfo>, String> {
    let json = run_ps(
        "Get-PnpDevice -Class Camera -ErrorAction SilentlyContinue | Select-Object FriendlyName, Status, Present, InstanceId, Problem, Class | ConvertTo-Json -Compress"
    )?;
    parse_devices(&json)
}

#[tauri::command]
pub fn get_audio_endpoints() -> Result<Vec<DeviceInfo>, String> {
    let json = run_ps(
        "Get-PnpDevice -Class AudioEndpoint -ErrorAction SilentlyContinue | Where-Object { $_.Present } | Select-Object FriendlyName, Status, Present, InstanceId, Problem, Class | ConvertTo-Json -Compress"
    )?;
    parse_devices(&json)
}

#[tauri::command]
pub fn get_usb_devices() -> Result<Vec<DeviceInfo>, String> {
    let json = run_ps(
        "Get-PnpDevice -Class USB -PresentOnly -ErrorAction SilentlyContinue | Select-Object FriendlyName, Status, Present, InstanceId, Problem, Class | ConvertTo-Json -Compress"
    )?;
    parse_devices(&json)
}

#[tauri::command]
pub fn get_ghost_count() -> Result<GhostStats, String> {
    let json = run_ps(
        "@{ camera = @(Get-PnpDevice -Class Camera -ErrorAction SilentlyContinue | Where-Object { -not $_.Present }).Count; audio = @(Get-PnpDevice -Class AudioEndpoint -ErrorAction SilentlyContinue | Where-Object { -not $_.Present }).Count; usb = @(Get-PnpDevice -Class USB -ErrorAction SilentlyContinue | Where-Object { -not $_.Present }).Count; total = @(Get-PnpDevice -ErrorAction SilentlyContinue | Where-Object { -not $_.Present }).Count } | ConvertTo-Json -Compress"
    )?;
    serde_json::from_str(&json).map_err(|e| format!("Parse error: {}", e))
}
