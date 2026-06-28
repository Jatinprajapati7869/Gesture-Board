<div align="center">
  
# 🖖 GestureBoard

**Control presentations with your bare hands. No clickers, no keyboards.**

A modern, touchless presentation tool powered by Computer Vision. Navigate slides, cast a laser pointer, and draw digital ink using real-time AI hand tracking directly in your browser. Built entirely on the client side with React, Vite, and Google's MediaPipe.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react)
![MediaPipe](https://img.shields.io/badge/MediaPipe-0.10.14-green)

</div>

---

## ✨ Features

- 📸 **Webcam-Powered Tracking**: Utilizes Google's MediaPipe Hand Landmarker model running at 60fps in the browser. Zero server-side processing required. Privacy first.
- 📄 **PDF Presentation Engine**: High-fidelity PDF rendering using Mozilla's `pdf.js`. Slide changes happen instantly without blocking the main thread thanks to web workers.
- ✌️ **Touchless Navigation**:
  - **Peace Sign (or Swipe Right)**: Advance to the next slide.
  - **Open Palm (or Swipe Left)**: Return to the previous slide.
- 🎯 **Laser Pointer**: Extend your **Index Finger** to project a responsive, smooth laser pointer onto your slides.
- ✍️ **Digital Whiteboard**: Use the **Pinch** gesture (thumb and index finger together) to draw digital ink. All annotations are saved per-slide and automatically persist when flipping back and forth.
- 🎓 **Interactive Onboarding**: A built-in calibration tutorial ensures your camera is correctly positioned and your gestures are recognized before you start presenting.
- ⚙️ **Customizable**: Dive into the Settings menu to adjust gesture sensitivity thresholds or disable camera mirroring.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (with custom CSS variables for effortless theming)
- **State Management**: Zustand (with LocalStorage persistence for settings)
- **Computer Vision**: `@mediapipe/tasks-vision` (WASM backend)
- **PDF Rendering**: `pdfjs-dist` (with Web Workers)
- **Icons**: `lucide-react`

---

## 🚀 Getting Started

To run this project locally, you will need [Node.js](https://nodejs.org/) installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/Jatinprajapati7869/Gesture-Board.git
cd Gesture-Board
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```

Your app should now be running on `http://localhost:5173`. 

> **Note**: Your browser will ask for Camera Permissions upon launching the app or entering the Onboarding flow. You must allow this for the application to function.

---

## 🧠 How It Works (Architecture Overview)

GestureBoard is split into three decoupled modules connected via headless Zustand hooks:

1. **Hand Tracking Engine (`/features/hand-tracking`)**: Captures video frames via `requestAnimationFrame`, feeds them into the MediaPipe WASM model, and extracts 21 3D hand landmarks. A custom heuristics engine (`gesture-recognition.ts`) maps these geometric points into discrete gestures (Peace, Fist, Pinch, etc.).
2. **Presentation Engine (`/features/presentation`)**: A Web-Worker powered PDF Canvas renderer that displays documents and handles window resizing elegantly without losing DPI quality.
3. **Integration Layer (`useGestureIntegration.ts`)**: Acts as the bridge. It reads coordinates from the Tracking Engine, translates them into the normalized coordinate space of the Presentation Canvas, handles Debouncing/Cooldowns (so one Peace sign doesn't skip 50 slides instantly), and triggers Zustand actions.

Because these systems are decoupled, the UI components remain incredibly clean and isolated from the heavy math of computer vision.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Jatinprajapati7869/Gesture-Board/issues).

---

## 📝 License

This project is [MIT](LICENSE) licensed.
