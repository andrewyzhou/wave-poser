# WavePoser: Real-Time Pose-to-Audio Synthesis

## Context/Problem

Traditional music interfaces rely on keyboards, controllers, or touch screens. I wanted to explore whether human movement could directly generate sound, creating an intuitive, embodied musical experience. The challenge was building a real-time system that converts body pose into meaningful audio with low latency, smooth transitions, and responsive feedback—all running in a web browser.

## What I Built

**Technical Implementation:**
I built WavePoser, a full-stack web application that transforms human pose into synthesized audio waveforms. The system uses MediaPipe to track six keypoints (shoulders, elbows, wrists) at 30fps, converts pose coordinates into custom waveforms through geometric transformations, and synthesizes audio using Tone.js and the Web Audio API.

The core innovation is a dual-oscillator architecture with volume-based crossfading. When pose changes, I compute a Discrete Fourier Transform to extract 32 harmonic partials from the waveform, update a silent oscillator with the new waveform, then crossfade between oscillators over 0.5 seconds. This eliminates audio glitches while maintaining real-time responsiveness.

I implemented pose smoothing using exponential moving averages to reduce jitter, normalized coordinates to handle varying camera positions, and created a modular React architecture with custom hooks for pose detection, waveform generation, and audio synthesis. The frontend includes real-time waveform visualization, pose overlay diagnostics, and granular audio controls (distortion, saturation, EQ, reverb).

**Product Perspective:**
The application provides an interactive experience where users can move their arms to create different waveforms, switch between pose-based and traditional waveforms (sine, saw, square), and manipulate audio effects in real-time. The UI features a split-screen design with live camera feed and waveform visualization on the left, and audio controls on the right.

## Blockers and Solutions

**Challenge 1: Audio Glitches During Waveform Updates**
Initial implementation caused audible pops when switching waveforms. Solution: Implemented dual-oscillator crossfading where one oscillator updates while silent, then volumes ramp smoothly. This required careful state management to track which oscillator is active and coordinate disposal/recreation of Tone.js oscillators.

**Challenge 2: Pose Detection Jitter**
Raw MediaPipe output produced unstable waveforms from frame-to-frame noise. Solution: Added exponential smoothing (alpha=0.5) to keypoint positions, requiring only 4 of 6 keypoints for partial tracking, and implemented a 10-frame buffer before declaring tracking lost.

**Challenge 3: Latency and Performance**
Real-time DFT computation (32 harmonics × 2048 samples) was computationally expensive. Solution: Throttled waveform updates to 10Hz, used requestAnimationFrame for pose detection, and optimized by computing DFT only when pose actually changes. For low-end devices, I added visibility-based animation pausing.

**Challenge 4: Browser Audio Context Restrictions**
Web Audio API requires user interaction to start. Solution: Implemented a landing page with explicit "Start Audio" button, and added proper error handling for camera permission denials with retry mechanisms.

## Impact and Key Learnings

WavePoser demonstrates that real-time media processing in browsers is viable for creative applications. The project taught me to think about latency holistically—not just algorithm speed, but end-to-end pipeline design. I learned that smooth audio transitions require careful state management and that pose detection systems need robust fallback strategies.

The most valuable insight was designing for graceful degradation: the system works with partial pose data, handles tracking loss, and provides fallback waveforms. This mirrors production systems where edge cases determine user experience quality.

From a product perspective, I learned that real-time interactive tools need immediate visual and auditory feedback. The waveform visualization and pose overlay create a tight feedback loop that makes the system feel responsive even with inherent processing delays.

This project directly relates to Twitch's domain: real-time media processing, low-latency systems, creator tools, and interactive experiences. The technical challenges—synchronization, performance optimization, and handling browser constraints—are core to building live streaming features.

