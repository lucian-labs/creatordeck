use crate::powershell::run_ps;
use chrono::Local;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct TimelineEvent {
    pub timestamp: String,
    pub device_name: String,
    pub device_class: String,
    pub event_type: String, // "connected", "disconnected", "error", "recovered"
    pub detail: String,
}

pub struct TimelineState {
    pub events: Vec<TimelineEvent>,
    pub last_snapshot: HashMap<String, String>, // instance_id -> status
}

impl TimelineState {
    pub fn new() -> Self {
        Self {
            events: Vec::new(),
            last_snapshot: HashMap::new(),
        }
    }
}

pub type TimelineStore = Mutex<TimelineState>;

pub fn poll_devices(store: &TimelineStore) {
    let json = match run_ps(
        "Get-PnpDevice -Class Camera, AudioEndpoint, USB -ErrorAction SilentlyContinue | \
         Where-Object { $_.FriendlyName -ne $null } | \
         Select-Object FriendlyName, Status, Present, InstanceId, Class | \
         ConvertTo-Json -Compress"
    ) {
        Ok(j) => j,
        Err(_) => return,
    };

    if json.is_empty() || json == "null" {
        return;
    }

    #[derive(Deserialize)]
    struct PollDevice {
        #[serde(rename = "FriendlyName")]
        friendly_name: Option<String>,
        #[serde(rename = "Status")]
        status: String,
        #[serde(rename = "Present")]
        present: bool,
        #[serde(rename = "InstanceId")]
        instance_id: String,
        #[serde(rename = "Class")]
        class: Option<String>,
    }

    let devices: Vec<PollDevice> = if json.starts_with('[') {
        serde_json::from_str(&json).unwrap_or_default()
    } else {
        serde_json::from_str::<PollDevice>(&json)
            .map(|d| vec![d])
            .unwrap_or_default()
    };

    let mut state = match store.lock() {
        Ok(s) => s,
        Err(_) => return,
    };

    let now = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    let mut current: HashMap<String, String> = HashMap::new();

    for device in &devices {
        let effective_status = if device.present {
            device.status.clone()
        } else {
            "Disconnected".to_string()
        };
        current.insert(device.instance_id.clone(), effective_status.clone());

        let name = device
            .friendly_name
            .clone()
            .unwrap_or_else(|| "Unknown Device".to_string());
        let class = device.class.clone().unwrap_or_default();

        // Skip USB hubs and composites for timeline noise reduction
        if class == "USB"
            && !name.contains("Host Controller")
            && !name.contains("Root Hub")
            && !name.contains("Cam")
            && !name.contains("Webcam")
        {
            continue;
        }

        if let Some(prev_status) = state.last_snapshot.get(&device.instance_id) {
            if *prev_status != effective_status {
                let prev = prev_status.clone();
                let event_type = match (prev.as_str(), effective_status.as_str()) {
                    (_, "Disconnected") => "disconnected",
                    ("Disconnected", "OK") => "connected",
                    ("Disconnected", _) => "connected",
                    (_, "Error") => "error",
                    ("Error", "OK") => "recovered",
                    (_, "OK") => "recovered",
                    _ => "changed",
                };

                state.events.push(TimelineEvent {
                    timestamp: now.clone(),
                    device_name: name,
                    device_class: class,
                    event_type: event_type.to_string(),
                    detail: format!("{} -> {}", prev, effective_status),
                });
            }
        }
        // Don't log initial snapshot as events — just record baseline
    }

    state.last_snapshot = current;

    // Keep last 500 events max
    if state.events.len() > 500 {
        let drain = state.events.len() - 500;
        state.events.drain(..drain);
    }
}

#[tauri::command]
pub fn get_timeline_events(
    state: tauri::State<'_, TimelineStore>,
) -> Result<Vec<TimelineEvent>, String> {
    let store = state.lock().map_err(|e| format!("Lock error: {}", e))?;
    Ok(store.events.clone())
}

#[tauri::command]
pub fn clear_timeline(state: tauri::State<'_, TimelineStore>) -> Result<(), String> {
    let mut store = state.lock().map_err(|e| format!("Lock error: {}", e))?;
    store.events.clear();
    Ok(())
}
