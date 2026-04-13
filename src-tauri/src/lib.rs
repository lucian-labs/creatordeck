mod actions;
mod cache;
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
use cache::{AppCache, CachedData};
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
            if (dx * dx + dy * dy).sqrt() <= radius {
                let idx = ((y * size + x) * 4) as usize;
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
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .manage::<AppCache>(Mutex::new(CachedData::default()))
        .manage::<TimelineStore>(Mutex::new(TimelineState::new()))
        .setup(|app| {
            // -- System Tray --
            let show_item = MenuItemBuilder::with_id("show", "Show CreatorDeck").build(app)?;
            let quit_item = MenuItemBuilder::with_id("quit", "Quit").build(app)?;
            let menu = MenuBuilder::new(app)
                .item(&show_item)
                .separator()
                .item(&quit_item)
                .build()?;

            let icon = Image::new_owned(create_tray_icon(&[139, 92, 246, 255]), 32, 32);

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
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        if let Some(w) = tray.app_handle().get_webview_window("main") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                })
                .build(app)?;

            // -- Close to tray --
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

            // -- Single background thread for ALL polling --
            let handle = app.handle().clone();
            std::thread::spawn(move || {
                let mut tick: u64 = 0;

                // Initial load
                {
                    let c = handle.state::<AppCache>();
                    cache::refresh_cache(c.inner());
                    cache::refresh_ghost_stats(c.inner());
                    let t = handle.state::<TimelineStore>();
                    timeline::poll_devices(t.inner());
                }

                loop {
                    std::thread::sleep(std::time::Duration::from_secs(5));
                    tick += 1;

                    // Devices + processes: every 5s
                    let c = handle.state::<AppCache>();
                    cache::refresh_cache(c.inner());

                    // Timeline: every 10s
                    if tick % 2 == 0 {
                        let t = handle.state::<TimelineStore>();
                        timeline::poll_devices(t.inner());
                    }

                    // Ghost stats: every 60s
                    if tick % 12 == 0 {
                        cache::refresh_ghost_stats(c.inner());
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Cache-based instant reads
            cache::get_cached_data,
            // On-demand queries (ghost viewer, device detail)
            devices::get_ghost_count,
            devices::get_ghost_devices,
            actions::fix_cameras,
            actions::reset_usb,
            actions::reset_device,
            actions::get_device_detail,
            actions::clean_ghosts,
            timeline::get_timeline_events,
            timeline::clear_timeline,
        ])
        .run(tauri::generate_context!())
        .expect("error while running CreatorDeck");
}
