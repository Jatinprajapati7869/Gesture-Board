# GestureBoard

GestureBoard is a browser-based presentation tool that uses computer vision to track hand movements, allowing users to control slides, point, and draw annotations without physical input devices.

## Features

- **Local Processing**: Hand tracking runs entirely client-side via Google MediaPipe and WebAssembly. No image data is sent to external servers.
- **PDF Rendering**: High-performance document rendering utilizing Mozilla's PDF.js and Web Workers to maintain a responsive main thread.
- **Gesture Navigation**: Navigate slides using distinct hand gestures (e.g., Peace sign to advance, Open Palm to go back).
- **Digital Ink**: Pinch gestures enable real-time canvas drawing over presentation slides. Annotations are persisted per-slide.
- **Laser Pointer**: Extending the index finger tracks and renders a smooth cursor on the active slide.
- **Calibration Flow**: Built-in onboarding sequence to verify camera input and confirm gesture recognition thresholds before presenting.

## Architecture Overview

The system is decoupled into three primary modules:
1. **Tracking Engine (`/features/hand-tracking`)**: Polls the webcam via `requestAnimationFrame` and processes frames through MediaPipe to extract 3D hand landmarks. A heuristics layer (`gesture-recognition.ts`) maps coordinate thresholds to discrete gesture states.
2. **Presentation Engine (`/features/presentation`)**: Manages the PDF document state and renders the active slide onto a scalable canvas.
3. **Integration Layer (`useGestureIntegration.ts`)**: Bridges the tracking and presentation modules. It handles coordinate normalization, debounce logic for navigation, and dispatches actions to the global state manager.

State management is handled by Zustand, providing isolated stores for gestures, annotations, and user settings.

## Getting Started

### Prerequisites

- Node.js 18.x or later
- A modern web browser with camera permissions enabled

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Jatinprajapati7869/Gesture-Board.git
   cd Gesture-Board
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`. 

## Development Stack

- **Core**: React 19, TypeScript, Vite
- **Computer Vision**: @mediapipe/tasks-vision
- **Document Processing**: pdfjs-dist
- **State Management**: Zustand
- **Styling**: Tailwind CSS v4

## License

MIT License
