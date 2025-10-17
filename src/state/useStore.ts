import { create } from 'zustand'

export interface Vec2 {
  x: number
  y: number
}

export interface Keypoint {
  x: number
  y: number
  score: number
}

export interface Pose {
  keypoints: Map<string, Keypoint>
}

export interface AppState {
  // Tracking state
  isTracking: boolean
  trackingLost: boolean
  pose: Pose | null
  
  // Audio controls
  freqHz: number
  distortion: number
  saturation: number
  eq: { low: number; mid: number; high: number } // dB
  reverb: { size: number; strength: number }
  volumeDb: number
  
  // Waveform state
  currentWaveTable: Float32Array | null
  lastUpdate: number
  waveformMode: 'camera' | 'sine' | 'saw' | 'square'
  
  // Actions
  set: (patch: Partial<AppState>) => void
  setPose: (pose: Pose | null) => void
  setTrackingLost: (lost: boolean) => void
  setWaveTable: (table: Float32Array) => void
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  isTracking: false,
  trackingLost: false,
  pose: null,
  
  freqHz: 220,
  distortion: 0,
  saturation: 0,
  eq: { low: 0, mid: 0, high: 0 },
  reverb: { size: 0.5, strength: 0.3 },
  volumeDb: -9,
  
  currentWaveTable: null,
  lastUpdate: 0,
  waveformMode: 'camera',
  
  // Actions
  set: (patch) => set(patch),
  setPose: (pose) => set({ pose, isTracking: pose !== null }),
  setTrackingLost: (trackingLost) => set({ trackingLost }),
  setWaveTable: (currentWaveTable) => set({ currentWaveTable, lastUpdate: Date.now() }),
}))
