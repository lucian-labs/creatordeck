use crate::powershell::run_ps;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ProcessInfo {
    pub id: u32,
    pub name: String,
    pub title: Option<String>,
    pub media_types: Vec<String>,
}

#[tauri::command]
pub fn get_media_processes() -> Result<Vec<ProcessInfo>, String> {
    let json = run_ps(
        r#"Get-Process -EA SilentlyContinue | Where-Object { $_.Modules -ne $null } | ForEach-Object { $p = $_; try { $mods = @($p.Modules.ModuleName); $types = @(); if ($mods -match 'avicap|vidcap|qcap') { $types += 'Camera' }; if ($mods -match 'ksproxy') { $types += 'Camera/Audio' }; if ($mods -match 'mmdevapi') { $types += 'Audio' }; if ($mods -match 'mfreadwrite') { $types += 'Media Read/Write' }; if ($mods -match 'mfplat' -and $types.Count -eq 0) { $types += 'Media Framework' }; if ($types.Count -gt 0) { [PSCustomObject]@{ id = $p.Id; name = $p.ProcessName; title = $p.MainWindowTitle; media_types = $types } } } catch {} } | Sort-Object name -Unique | ConvertTo-Json -Depth 3 -Compress"#
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
