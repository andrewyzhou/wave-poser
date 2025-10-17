# Wave Poser 🎵

A real-time pose-to-waveform synthesizer that converts your body movements into musical waveforms using MediaPipe pose detection and Tone.js audio synthesis.

## 🎯 Features

- **Real-time Pose Detection**: Uses MediaPipe to track 6 key body points (shoulders, elbows, wrists)
- **Live Waveform Generation**: Converts pose coordinates into custom audio waveforms
- **Multiple Waveform Modes**: 
  - Camera mode with pose-based waveforms
  - Default modes (sine, sawtooth, square waves)
- **Smooth Audio Crossfading**: 5-second volume-based transitions between waveforms
- **Audio Effects**: Distortion, saturation, EQ, reverb, and volume controls
- **Visual Feedback**: Real-time waveform visualization and pose overlay

## 🚀 Live Demo

[Deploy on Vercel](https://vercel.com) - Coming soon!

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Audio**: Tone.js for Web Audio API
- **Pose Detection**: MediaPipe Tasks Vision
- **State Management**: Zustand

## 🎮 How to Use

1. **Start the app** and click "Start Audio"
2. **Choose a mode**:
   - **Camera**: Uses your pose to generate waveforms
   - **Sine/Saw/Square**: Plays default waveforms
3. **Adjust effects** using the control panel
4. **Move your arms** to create different waveforms in camera mode

## 🎵 Audio Engine

The app features a dual-oscillator system with volume-based crossfading:

- **Default Modes**: Single oscillator with immediate waveform updates
- **Camera Mode**: Dual oscillators with 5-second smooth crossfades
- **No Audio Cuts**: Waveform updates only occur when oscillators are silent

## 🎨 Visual Features

- **Pose Overlay**: Green dots and lines showing detected body points
- **Waveform Canvas**: Real-time visualization of generated waveforms
- **Pose Diagnostics**: Live percentage display of keypoint visibility
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── Controls/        # Audio effect controls
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useAudioEngine.ts    # Audio synthesis logic
│   ├── usePoseDetector.ts   # MediaPipe integration
│   └── useWaveTable.ts      # Waveform generation
├── lib/                 # Utility functions
│   ├── waveform.ts          # Waveform math
│   └── mapping.ts           # Pose keypoint mapping
└── state/               # Zustand store
```

## 🎯 Key Components

- **useAudioEngine**: Manages dual-oscillator audio system with crossfading
- **usePoseDetector**: Handles MediaPipe pose detection and smoothing
- **useWaveTable**: Converts pose coordinates to audio waveforms
- **WaveCanvas**: Visualizes waveforms in real-time
- **PoseOverlay**: Draws pose detection on camera feed

## 🔧 Audio Architecture

The audio engine uses a sophisticated dual-oscillator setup:

1. **Single Oscillator Mode** (defaults): Simple waveform replacement
2. **Dual Oscillator Mode** (camera): Volume-based crossfading
   - Oscillator A fades out while B fades in
   - Waveform updates only when volume is 0
   - 5-second smooth transitions

## 🎨 UI/UX Features

- **Animated Landing Page**: Smooth entrance animations
- **Custom Sliders**: Vertical sliders for audio controls
- **Responsive Grid**: Adapts to different screen sizes
- **Real-time Feedback**: Live pose diagnostics and waveform display

## 📱 Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Mobile**: Responsive design with touch controls

## 🚀 Deployment

The app is optimized for deployment on Vercel with:
- Static generation for fast loading
- Edge runtime compatibility
- Automatic HTTPS and CDN

## 📄 License

MIT License - feel free to use this project for your own creations!

## 👨‍💻 Author

Created by Andrew Zhou

---

*Turn your body into a musical instrument!* 🎵✨