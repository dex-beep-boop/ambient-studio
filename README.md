# 🎧 Ambient Studio

A browser-based ambient soundscape mixer. No audio files, no API keys, no installs — everything synthesized live using the Web Audio API.

**[→ Try it live](https://dex-beep-boop.github.io/ambient-studio/)**

## Sounds

| Layer | Type |
|-------|------|
| 🌧️ Rain | Pink noise filtered through resonant lowpass |
| ⛈️ Thunder | Periodic brown noise bursts with reverb envelope |
| 🌿 Forest | Layered bandpass noise + LFO modulation |
| 🔥 Fire | Crackling brown noise with randomized gain |
| 🌊 Ocean | Slow LFO-swept lowpass on white noise |
| 💨 Wind | Highpass pink noise with gentle tremolo |

## Presets

- **Deep Focus** — Rain + Forest, low intensity
- **Late Night** — Ocean + Wind, minimal
- **Morning Forest** — Forest + light Rain
- **Storm Season** — Rain + Thunder + Wind, full intensity

## Features

- Toggle each layer on/off independently
- Per-layer volume control with smooth fade transitions
- Mix and save your own combinations
- Runs entirely in the browser — no server, no data sent anywhere

## Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS v4
- Web Audio API (no external audio libraries)

## Run Locally

```bash
bun install
bun run dev
```

Open `http://localhost:3004`

## Build

```bash
bun run build
```
