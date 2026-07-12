# GestureBoard

![CI](https://github.com/Jatinprajapati7869/Gesture-Board/actions/workflows/ci.yml/badge.svg)

GestureBoard is a browser-based presentation tool that uses computer vision to track hand movements, control slides, and draw annotations without physical input devices.

## Demo

The app works with a camera, but it also includes a no-camera demo path. If permissions are blocked, use the demo controls in Presentation Mode to navigate slides, switch tools, and clear annotations.

## Features

- Local processing: hand tracking runs entirely client-side through MediaPipe and WebAssembly.
- PDF rendering: PDF.js loads and renders slides on a responsive canvas.
- Gesture navigation: Peace advances slides, Open Palm goes back.
- Digital ink: pinch gestures draw directly on the slide.
- Laser pointer: index finger tracking renders a smooth cursor.
- Calibration flow: onboarding verifies the camera path before presenting.
- Demo fallback: presentation controls remain usable without camera access.

## Engineering Highlights

- Real-time MediaPipe tracking with a decoupled heuristics layer.
- Presentation, tracking, and annotation stores are isolated with Zustand.
- Gesture debounce logic prevents accidental double navigation.
- Annotation persistence is maintained per slide.
- Fallback demo controls keep the app usable in meetings without camera approval.
- Tests cover stores, gesture recognition, integration logic, and UI flows.
- CI runs lint, test, and build checks.

## Architecture Overview

1. Tracking engine: webcam frames are processed through MediaPipe to extract 3D hand landmarks.
2. Presentation engine: PDF.js renders the active slide to canvas.
3. Integration layer: gesture events drive slide navigation and annotation dispatch.

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm

### Install

```powershell
npm install
```

### Run

```powershell
npm run dev
```

Open `http://localhost:5173` in your browser.

## Verification

```powershell
npm run lint
npm test -- --run
npm run build
```

## Known Limitations

- PDF.js and MediaPipe add bundle weight, so the production build emits chunk-size warnings.
- Camera tracking depends on good lighting and a visible hand.
- Single-hand tracking is the supported path.

## License

MIT License. See [LICENSE](LICENSE).