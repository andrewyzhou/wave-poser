import { Vec2 } from '@/state/useStore'

export const REQUIRED_KEYPOINTS = [
  'left_shoulder',
  'right_shoulder', 
  'left_elbow',
  'right_elbow',
  'left_wrist',
  'right_wrist'
] as const

export type KeypointName = typeof REQUIRED_KEYPOINTS[number]

export function getKeypointOrder(): KeypointName[] {
  return [
    'right_wrist',
    'right_elbow', 
    'right_shoulder',
    'left_shoulder',
    'left_elbow',
    'left_wrist'
  ]
}

export function smooth(prev: Vec2, curr: Vec2, alpha = 0.5): Vec2 {
  return {
    x: alpha * prev.x + (1 - alpha) * curr.x,
    y: alpha * prev.y + (1 - alpha) * curr.y
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function getFrequencyFromNote(note: string, octave: number): number {
  const noteMap: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
  }
  
  const semitone = noteMap[note] || 0
  const midiNote = 12 + (octave * 12) + semitone
  return 440 * Math.pow(2, (midiNote - 69) / 12)
}

export function getNearestNote(frequency: number): { note: string; octave: number; cents: number } {
  const midiNote = 12 * Math.log2(frequency / 440) + 69
  const roundedMidi = Math.round(midiNote)
  const cents = Math.round((midiNote - roundedMidi) * 100)
  
  const octave = Math.floor((roundedMidi - 12) / 12)
  const semitone = ((roundedMidi % 12) + 12) % 12
  
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const note = noteNames[semitone]
  
  return { note, octave, cents }
}
