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

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct GhostDevice {
    pub name: String,
    pub class: String,
    pub instance_id: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AllDeviceData {
    pub cameras: Vec<DeviceInfo>,
    pub audio_endpoints: Vec<DeviceInfo>,
    pub usb_devices: Vec<DeviceInfo>,
}

fn parse_devices(json: &str) -> Vec<DeviceInfo> {
    if json.is_empty() || json == "null" {
        return vec![];
    }
    if json.starts_with('[') {
        serde_json::from_str(json).unwrap_or_default()
    } else {
        serde_json::from_str::<DeviceInfo>(json)
            .map(|d| vec![d])
            .unwrap_or_default()
    }
}

/// Lightweight poll — only present/active devices, no ghost scanning.
#[tauri::command]
pub fn get_all_devices() -> Result<AllDeviceData, String> {
    let json = run_ps(
        r#"
$cameras = @(Get-PnpDevice -Class Camera -EA SilentlyContinue | Select FriendlyName, Status, Present, InstanceId, Problem, Class)
$audio = @(Get-PnpDevice -Class AudioEndpoint -EA SilentlyContinue | Where { $_.Present } | Select FriendlyName, Status, Present, InstanceId, Problem, Class)
$usb = @(Get-PnpDevice -Class USB -PresentOnly -EA SilentlyContinue | Where { $_.FriendlyName -match 'Host Controller|Root Hub' } | Select FriendlyName, Status, Present, InstanceId, Problem, Class)
@{ cameras = $cameras; audio_endpoints = $audio; usb_devices = $usb } | ConvertTo-Json -Depth 3 -Compress
"#,
    )?;
    serde_json::from_str::<AllDeviceData>(&json)
        .map_err(|e| format!("Parse error: {}", e))
}

/// Expensive query — only called on demand or infrequently.
#[tauri::command]
pub fn get_ghost_count() -> Result<GhostStats, String> {
    let json = run_ps(
        "@{ camera = @(Get-PnpDevice -Class Camera -EA SilentlyContinue | Where { -not $_.Present }).Count; audio = @(Get-PnpDevice -Class AudioEndpoint -EA SilentlyContinue | Where { -not $_.Present }).Count; usb = @(Get-PnpDevice -Class USB -EA SilentlyContinue | Where { -not $_.Present }).Count; total = @(Get-PnpDevice -EA SilentlyContinue | Where { -not $_.Present }).Count } | ConvertTo-Json -Compress"
    )?;
    serde_json::from_str(&json).map_err(|e| format!("Parse error: {}", e))
}

/// Returns actual ghost device names so user can inspect before deleting.
#[tauri::command]
pub fn get_ghost_devices() -> Result<Vec<GhostDevice>, String> {
    let json = run_ps(
        r#"@(Get-PnpDevice -EA SilentlyContinue | Where { -not $_.Present -and $_.FriendlyName -ne $null } | Select @{N='name';E={$_.FriendlyName}}, @{N='class';E={$_.Class}}, @{N='instance_id';E={$_.InstanceId}} | Sort-Object class, name) | ConvertTo-Json -Compress"#
    )?;
    if json.is_empty() || json == "null" {
        return Ok(vec![]);
    }
    if json.starts_with('[') {
        serde_json::from_str(&json).map_err(|e| format!("Parse error: {}", e))
    } else {
        serde_json::from_str::<GhostDevice>(&json)
            .map(|d| vec![d])
            .map_err(|e| format!("Parse error: {}", e))
    }
}

#[tauri::command]
pub fn get_cameras() -> Result<Vec<DeviceInfo>, String> {
    let json = run_ps(
        "Get-PnpDevice -Class Camera -EA SilentlyContinue | Select FriendlyName, Status, Present, InstanceId, Problem, Class | ConvertTo-Json -Compress"
    )?;
    Ok(parse_devices(&json))
}

#[tauri::command]
pub fn get_audio_endpoints() -> Result<Vec<DeviceInfo>, String> {
    let json = run_ps(
        "Get-PnpDevice -Class AudioEndpoint -EA SilentlyContinue | Where { $_.Present } | Select FriendlyName, Status, Present, InstanceId, Problem, Class | ConvertTo-Json -Compress"
    )?;
    Ok(parse_devices(&json))
}

#[tauri::command]
pub fn get_usb_devices() -> Result<Vec<DeviceInfo>, String> {
    let json = run_ps(
        "Get-PnpDevice -Class USB -PresentOnly -EA SilentlyContinue | Select FriendlyName, Status, Present, InstanceId, Problem, Class | ConvertTo-Json -Compress"
    )?;
    Ok(parse_devices(&json))
}
