use crate::powershell::{run_ps, run_ps_elevated};

#[tauri::command]
pub fn fix_cameras() -> Result<String, String> {
    run_ps_elevated(
        "Restart-Service -Name FrameServer -Force -EA SilentlyContinue; \
         Get-PnpDevice -Class Camera -PresentOnly -EA SilentlyContinue | ForEach-Object { \
           Disable-PnPDevice -InstanceId $_.InstanceId -Confirm:$false -EA SilentlyContinue; \
           Start-Sleep -Milliseconds 500; \
           Enable-PnPDevice -InstanceId $_.InstanceId -Confirm:$false -EA SilentlyContinue \
         }; \
         pnputil /scan-devices"
    )
}

#[tauri::command]
pub fn reset_usb() -> Result<String, String> {
    run_ps_elevated(
        "Get-PnpDevice -Class USB -PresentOnly -EA SilentlyContinue | \
         Where-Object { $_.FriendlyName -match 'Host Controller|Root Hub' } | ForEach-Object { \
           Disable-PnPDevice -InstanceId $_.InstanceId -Confirm:$false -EA SilentlyContinue; \
           Start-Sleep -Milliseconds 500; \
           Enable-PnPDevice -InstanceId $_.InstanceId -Confirm:$false -EA SilentlyContinue \
         }; \
         pnputil /scan-devices"
    )
}

/// Reset a specific USB device by instance ID.
/// Disables, waits, re-enables, then scans for hardware changes.
#[tauri::command]
pub fn reset_device(instance_id: String) -> Result<String, String> {
    // Validate instance_id looks legit (no injection)
    if instance_id.contains('"') || instance_id.contains(';') || instance_id.contains('|') {
        return Err("Invalid instance ID".to_string());
    }
    run_ps_elevated(&format!(
        "Disable-PnPDevice -InstanceId '{}' -Confirm:$false -EA SilentlyContinue; \
         Start-Sleep -Seconds 2; \
         Enable-PnPDevice -InstanceId '{}' -Confirm:$false -EA SilentlyContinue; \
         pnputil /scan-devices",
        instance_id, instance_id
    ))
}

/// Get detail about a specific USB device's error state.
#[tauri::command]
pub fn get_device_detail(instance_id: String) -> Result<String, String> {
    if instance_id.contains('"') || instance_id.contains(';') {
        return Err("Invalid instance ID".to_string());
    }
    run_ps(&format!(
        "Get-PnpDevice -InstanceId '{}' -EA SilentlyContinue | Select FriendlyName, Status, Problem, ConfigManagerErrorCode, @{{N='Driver';E={{$_.GetDeviceProperties('DEVPKEY_Device_DriverVersion').Data}}}}, @{{N='LastArrival';E={{$_.GetDeviceProperties('DEVPKEY_Device_LastArrivalDate').Data}}}} | ConvertTo-Json -Compress",
        instance_id
    ))
}

#[tauri::command]
pub fn clean_ghosts() -> Result<String, String> {
    run_ps_elevated(
        "Get-PnpDevice -EA SilentlyContinue | \
         Where-Object { -not $_.Present } | ForEach-Object { \
           pnputil /remove-device $_.InstanceId 2>$null \
         }"
    )
}
