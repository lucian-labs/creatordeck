# CreatorDeck

Content creator device dashboard for Windows. See which processes use your cameras and mics, diagnose USB issues, and fix device problems without rebooting.

## Features

- **Device Dashboard** — Camera and audio endpoint status at a glance (OK / Error / Unknown / Ghost)
- **USB Health** — USB controller status, ghost device detection and counts
- **Process Monitor** — Which apps have loaded media DLLs (camera/audio drivers)
- **Quick Actions** — One-click camera fix, USB reset, and ghost device cleanup (with UAC elevation)

## Why

Windows content creators constantly deal with cameras not detected in OBS, mysterious device locks, and USB subsystem rot from ghost devices accumulating over time. The only existing tools are scary sysadmin utilities like Process Explorer. CreatorDeck gives you a clean, visual dashboard purpose-built for streaming setups.

## Tech Stack

- **Tauri v2** — Lightweight native window (~5MB vs 150MB+ Electron)
- **React + TypeScript** — Frontend UI
- **Tailwind CSS v4** — Styling
- **Rust** — Backend device queries via PowerShell integration

## Development

```bash
# Prerequisites: Rust, Node.js
npm install
npm run tauri dev
```

## Build

```bash
npm run tauri build
# Creates installer in src-tauri/target/release/bundle/
```

## License

MIT
