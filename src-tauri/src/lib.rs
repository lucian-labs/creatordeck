mod actions;
mod devices;
mod powershell;
mod processes;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            devices::get_cameras,
            devices::get_audio_endpoints,
            devices::get_usb_devices,
            devices::get_ghost_count,
            processes::get_media_processes,
            actions::fix_cameras,
            actions::reset_usb,
            actions::clean_ghosts,
        ])
        .run(tauri::generate_context!())
        .expect("error while running CreatorDeck");
}
