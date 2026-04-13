use crate::powershell::run_ps_elevated;

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

#[tauri::command]
pub fn clean_ghosts() -> Result<String, String> {
    run_ps_elevated(
        "Get-PnpDevice -EA SilentlyContinue | \
         Where-Object { -not $_.Present } | ForEach-Object { \
           pnputil /remove-device $_.InstanceId 2>$null \
         }"
    )
}
