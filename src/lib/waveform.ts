import { Vec2, Keypoint } from '@/state/useStore'

export type WaveformMode = 'camera' | 'sine' | 'saw' | 'square'

// Convert pose keypoints to waveform using Option B approach
export function pointsToWaveTable(keypoints: Map<string, Keypoint>, N = 2048): Float32Array {
  const order = getKeypointOrder()
  const points: Vec2[] = []
  
  // Extract points in the correct order - only add points that exist
  for (const name of order) {
    const kp = keypoints.get(name)
    if (kp) {
      points.push({ x: kp.x, y: kp.y })
    }
  }
  
  // Only use default if we don't have exactly 6 keypoints
  if (points.length !== 6) {
    return createDefaultWaveTable(N)
  }
  
  // Step 1: Sort points by X coordinate
  const sortedPoints = [...points].sort((a, b) => a.x - b.x)
  
  // Step 2: Normalize coordinates
  // Translate so leftmost point is at x=0, rightmost point is at y=0
  const leftmostX = sortedPoints[0].x
  const rightmostY = sortedPoints[sortedPoints.length - 1].y
  
  const normalizedPoints = sortedPoints.map(p => ({
    x: p.x - leftmostX,
    y: p.y - rightmostY
  }))
  
  // Step 3: Create first half of waveform (pose shape)
  const firstHalf = normalizedPoints
  
  // Step 4: Duplicate and flip across both axes
  const flippedPoints = firstHalf.map(p => ({
    x: -p.x,
    y: -p.y
  })).reverse() // Reverse to maintain proper order
  
  // Step 5: Translate flipped points to connect with original
  const rightmostOriginalX = firstHalf[firstHalf.length - 1].x
  const leftmostFlippedX = flippedPoints[0].x
  const translateX = rightmostOriginalX - leftmostFlippedX
  
  const translatedFlippedPoints = flippedPoints.map(p => ({
    x: p.x + translateX,
    y: p.y
  }))
  
  // Step 6: Combine both halves
  const fullWaveform = [...firstHalf, ...translatedFlippedPoints]
  
  // Step 7: Normalize X-axis to proper length (N samples)
  const waveformLength = fullWaveform[fullWaveform.length - 1].x - fullWaveform[0].x
  const scaledPoints = fullWaveform.map(p => ({
    x: (p.x / waveformLength) * (N - 1),
    y: p.y
  }))
  
  // Step 8: Scale Y-axis to -0.5 to 0.5 range
  const yValues = scaledPoints.map(p => p.y)
  const minY = Math.min(...yValues)
  const maxY = Math.max(...yValues)
  const yRange = maxY - minY
  
  const scaledYPoints = scaledPoints.map(p => ({
    x: p.x,
    y: yRange > 0 ? ((p.y - minY) / yRange - 0.5) : 0
  }))
  
  // Step 9: Interpolate to create Float32Array
  const result = new Float32Array(N)
  
  for (let i = 0; i < N; i++) {
    // Find the two points to interpolate between
    let leftPoint = scaledYPoints[0]
    let rightPoint = scaledYPoints[scaledYPoints.length - 1]
    
    for (let j = 0; j < scaledYPoints.length - 1; j++) {
      if (i >= scaledYPoints[j].x && i <= scaledYPoints[j + 1].x) {
        leftPoint = scaledYPoints[j]
        rightPoint = scaledYPoints[j + 1]
        break
      }
    }
    
    // Linear interpolation
    if (rightPoint.x !== leftPoint.x) {
      const t = (i - leftPoint.x) / (rightPoint.x - leftPoint.x)
      result[i] = leftPoint.y + t * (rightPoint.y - leftPoint.y)
    } else {
      result[i] = leftPoint.y
    }
  }
  
  return result
}

// Generate waveform based on mode
export function generateWaveform(mode: WaveformMode, N = 2048): Float32Array {
  switch (mode) {
    case 'sine':
      return createSineWave(N)
    case 'saw':
      return createSawtoothWave(N)
    case 'square':
      return createSquareWave(N)
    case 'camera':
    default:
      return createDefaultWaveTable(N)
  }
}

/**
 * Ensures waveform continuity by adjusting the new waveform to start from the previous waveform's end point
 */
export function ensureWaveformContinuity(
  newWaveform: Float32Array, 
  previousEndY: number
): Float32Array {
  if (newWaveform.length === 0) return newWaveform
  
  // Get the first Y value of the new waveform
  const newStartY = newWaveform[0]
  
  // Calculate the offset needed to make the new waveform start from the previous end point
  const yOffset = previousEndY - newStartY
  
  // Apply the offset to the entire waveform
  const continuousWaveform = new Float32Array(newWaveform.length)
  for (let i = 0; i < newWaveform.length; i++) {
    continuousWaveform[i] = newWaveform[i] + yOffset
  }
  
  return continuousWaveform
}

// Simple default sine wave
function createDefaultWaveTable(N = 2048): Float32Array {
  return createSineWave(N)
}

// Clean sine wave (-0.5 to 0.5 range)
function createSineWave(N = 2048): Float32Array {
  const out = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2
    out[i] = Math.sin(t) * 0.5 // Range: -0.5 to 0.5
  }
  return out
}

// Sawtooth wave (-0.5 to 0.5 range)
function createSawtoothWave(N = 2048): Float32Array {
  const out = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    out[i] = (i / N) - 0.5 // Range: -0.5 to 0.5
  }
  return out
}

// Square wave (-0.5 to 0.5 range)
function createSquareWave(N = 2048): Float32Array {
  const out = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2
    out[i] = Math.sin(t) > 0 ? 0.5 : -0.5 // Range: -0.5 or 0.5
  }
  return out
}

// Simple mirroring - just duplicate the wave
export function createMirroredWaveform(table: Float32Array): Float32Array {
  const N = table.length
  const mirrored = new Float32Array(N * 2)
  
  // First half: original
  for (let i = 0; i < N; i++) {
    mirrored[i] = table[i]
  }
  
  // Second half: duplicate (no flipping for now)
  for (let i = 0; i < N; i++) {
    mirrored[N + i] = table[i]
  }
  
  return mirrored
}

// Get keypoint order for pose processing
function getKeypointOrder(): string[] {
  return [
    'left_shoulder',
    'left_elbow', 
    'left_wrist',
    'right_wrist',
    'right_elbow',
    'right_shoulder'
  ]
}