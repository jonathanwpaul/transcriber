# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm start          # dev server on :3000 (CRA via craco)
pnpm build          # production build → build/
pnpm test           # run tests
pnpm electron:dev   # Electron desktop dev mode
pnpm electron:build # package Electron app
```

Android builds use `./android-build-debug.sh` and `./android-emulate.sh`.

## Path aliases

Configured in `craco.config.js` and `jsconfig.json`:

| Alias | Resolves to |
|-------|-------------|
| `@lib` | `src/lib/*` |
| `@components` | `src/components/*` |
| `@utils` | `src/utils/*` |
| `@hooks` | `src/hooks/*` |

Base URL is `src/`, so bare imports like `import X from 'lib/...'` also work.

## Architecture

### Media abstraction layer (`src/lib/media/`)

`MediaPlayer.js` is an abstract base class that defines the playback interface (`play`, `pause`, `seekTo`, `setPlaybackRate`) and owns all persisted song metadata (BPM, loops, playback position). It communicates back to React via a callbacks object passed at construction time: `onReady`, `onTimeUpdate`, `onDuration`, `onPlayingChange`, `onPlaybackRateChange`, `onMetadataChange`, `onWaveformReady`.

Two concrete implementations:
- **`LocalFilePlayer.jsx`** — drives an `<audio>`/`<video>` element; wires up a Web Audio API chain: `MediaElementAudioSourceNode → 7× BiquadFilterNode (EQ) → AnalyserNode → destination`. Also decodes audio offline for waveform data.
- **`YouTubePlayer.jsx`** — wraps `react-youtube`, adapts the YT IFrame API to the same interface.

`Player.jsx` instantiates the right subclass based on `type === 'file'` vs YouTube, passes callbacks, and calls `renderComponent()` to render the media element inline.

### Data layer (`src/lib/storage/`)

TypeORM with CapacitorSQLite. On web it falls back to sql.js (WASM in-memory SQLite). Schema: `song`, `loop` (self-referential parent_id for nesting), `recording`, `settings`.

The main API is in `dbService.js`: `getSong(id)`, `patchSong(id, patch)`, `syncLoops(id, loops)`, `getAppSetting(key, default)`, `setAppSetting(key, value)`.

### UI layer

`src/components/ui/` contains Radix UI primitives (Slider, Dialog, Tooltip, etc.) wrapped in Tailwind. The custom `Slider` component supports `orientation="vertical"` and per-thumb `thumbClassNames`.

`Player.jsx` is the complex stateful view (~800 lines). The right sidebar holds TimeTextInput, BPMInput, saved loops, and (for local files) EqualizerCard. The EQ card uses `requestAnimationFrame` to animate FFT data from `player._analyserNode` over the static EQ curve on a canvas.

### Cross-platform

Capacitor (`com.transcriber.app`) targets Web, Android, and Electron. File I/O uses `@capacitor/filesystem` — on native it converts URIs with `Capacitor.convertFileSrc`, on web it reads files as base64 data URLs. Always check `Capacitor.isNativePlatform()` before using native-only APIs.
