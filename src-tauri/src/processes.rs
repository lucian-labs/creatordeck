use crate::powershell::run_ps;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ProcessInfo {
    #[serde(rename = "Id")]
    pub id: u32,
    #[serde(rename = "ProcessName")]
    pub process_name: String,
    #[serde(rename = "MainWindowTitle")]
    pub main_window_title: Option<String>,
}

#[tauri::command]
pub fn get_media_processes() -> Result<Vec<ProcessInfo>, String> {
    let json = run_ps(
        r#"Get-Process -EA SilentlyContinue | Where-Object { $_.Modules -ne $null } | ForEach-Object { $p = $_; try { if ($p.Modules.ModuleName -match 'mfplat|ksproxy|vidcap|mfreadwrite|mmdevapi|avicap') { $p | Select Id, ProcessName, @{N='MainWindowTitle';E={$_.MainWindowTitle}} } } catch {} } | Sort-Object ProcessName -Unique | ConvertTo-Json -Compress"#
    )?;
    if json.is_empty() || json == "null" {
        return Ok(vec![]);
    }
    if json.starts_with('[') {
        serde_json::from_str(&json).map_err(|e| format!("Parse error: {}", e))
    } else {
        serde_json::from_str::<ProcessInfo>(&json)
            .map(|p| vec![p])
            .map_err(|e| format!("Parse error: {}", e))
    }
}
