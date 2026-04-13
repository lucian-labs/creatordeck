mod actions;
mod devices;
mod powershell;
mod processes;
mod timeline;

use std::sync::Mutex;
use tauri::{
    image::Image,
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};
use tauri_plugin_autostart::MacosLauncher;
use timeline::{TimelineState, TimelineStore};

fn create_tray_icon(rgba: &[u8; 4]) -> Vec<u8> {
    let size = 32u32;
    let mut pixels = vec![0u8; (size * size * 4) as usize];
    let center = size as f64 / 2.0;
    let radius = 13.0;

    for y in 0..size {
        for x in 0..size {
            let dx = x as f64 - center;
            let dy = y as f64 - center;
            let dist = (dx * dx + dy * dy).sqrt();
            let idx = ((y * size + x) * 4) as usize;

            if dist <= radius {
                pixels[idx] = rgba[0];
                pixels[idx + 1] = rgba[1];
                pixels[idx + 2] = rgba[2];
                pixels[idx + 3] = rgba[3];
            }
        }
    }
    pixels
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let timeline_store: TimelineStore = Mutex::new(TimelineState::new());

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .manage(timeline_store)
        .setup(|app| {
            // -- System Tray --
            let show_item = MenuItemBuilder::with_id("show", "Show CreatorDeck").build(app)?;
            let quit_item = MenuItemBuilder::with_id("quit", "Quit").build(app)?;

            let menu = MenuBuilder::new(app)
                .item(&show_item)
                .separator()
                .item(&quit_item)
                .build()?;

            let icon_rgba = create_tray_icon(&[139, 92, 246, 255]); // accent purple
            let icon = Image::new_owned(icon_rgba, 32, 32);

            let _tray = TrayIconBuilder::new()
                .icon(icon)
                .menu(&menu)
                .tooltip("CreatorDeck")
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "show" => {
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                })
                .build(app)?;

            // -- Close to tray instead of quitting --
            let app_handle = app.handle().clone();
            if let Some(window) = app.get_webview_window("main") {
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        if let Some(w) = app_handle.get_webview_window("main") {
                            let _ = w.hide();
                        }
                    }
                });
            }

            // -- Timeline background polling --
            let handle = app.handle().clone();
            std::thread::spawn(move || {
                // Initial snapshot (no events logged, just baseline)
                {
                    let store = handle.state::<TimelineStore>();
                    timeline::poll_devices(store.inner());
                }
                loop {
                    std::thread::sleep(std::time::Duration::from_secs(10));
                    let store = handle.state::<TimelineStore>();
                    timeline::poll_devices(store.inner());
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            devices::get_all_devices,
            devices::get_cameras,
            devices::get_audio_endpoints,
            devices::get_usb_devices,
            devices::get_ghost_count,
            processes::get_media_processes,
            actions::fix_cameras,
            actions::reset_usb,
            actions::clean_ghosts,
            timeline::get_timeline_events,
            timeline::clear_timeline,
        ])
        .run(tauri::generate_context!())
        .expect("error while running CreatorDeck");
}
