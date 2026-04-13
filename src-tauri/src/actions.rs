use crate::powershell::run_ps_elevated;

#[tauri::command]
pub fn fix_cameras() -> Result<String, String> {
    run_ps_elevated(
        "Restart-Service -Name FrameServer -Force -ErrorAction SilentlyContinue; \
         Get-PnpDevice -Class Camera -PresentOnly -ErrorAction SilentlyContinue | ForEach-Object { \
           Disable-PnPDevice -InstanceId $_.InstanceId -Confirm:$false -ErrorAction SilentlyContinue; \
           Start-Sleep -Milliseconds 500; \
           Enable-PnPDevice -InstanceId $_.InstanceId -Confirm:$false -ErrorAction SilentlyContinue \
         }; \
         pnputil /scan-devices"
    )
}

#[tauri::command]
pub fn reset_usb() -> Result<String, String> {
    run_ps_elevated(
        "Get-PnpDevice -Class USB -PresentOnly -ErrorAction SilentlyContinue | \
         Where-Object { $_.FriendlyName -match 'Host Controller|Root Hub' } | ForEach-Object { \
           Disable-PnPDevice -InstanceId $_.InstanceId -Confirm:$false -ErrorAction SilentlyContinue; \
           Start-Sleep -Milliseconds 500; \
           Enable-PnPDevice -InstanceId $_.InstanceId -Confirm:$false -ErrorAction SilentlyContinue \
         }; \
         pnputil /scan-devices"
    )
}

#[tauri::command]
pub fn clean_ghosts() -> Result<String, String> {
    run_ps_elevated(
        "Get-PnpDevice -ErrorAction SilentlyContinue | \
         Where-Object { -not $_.Present } | ForEach-Object { \
           pnputil /remove-device $_.InstanceId 2>$null \
         }"
    )
}
