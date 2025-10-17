/**
 * Minimal DFT implementation to convert time-domain samples to Fourier partials
 * for creating PeriodicWave objects
 */

export function float32ArrayToPeriodicWave(samples: Float32Array, maxPartials = 64): {
  real: Float32Array
  imag: Float32Array
} {
  const N = samples.length
  const real = new Float32Array(maxPartials)
  const imag = new Float32Array(maxPartials)
  
  // DC component (0th harmonic)
  real[0] = 0
  imag[0] = 0
  
  // Compute DFT for each harmonic
  for (let k = 1; k < maxPartials; k++) {
    let realSum = 0
    let imagSum = 0
    
    for (let n = 0; n < N; n++) {
      const angle = -2 * Math.PI * k * n / N
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      
      realSum += samples[n] * cos
      imagSum += samples[n] * sin
    }
    
    // Normalize by N
    real[k] = realSum / N
    imag[k] = imagSum / N
  }
  
  return { real, imag }
}

export function createPeriodicWaveFromSamples(
  samples: Float32Array, 
  audioContext: AudioContext,
  maxPartials = 64
): PeriodicWave {
  const { real, imag } = float32ArrayToPeriodicWave(samples, maxPartials)
  return audioContext.createPeriodicWave(real, imag, { disableNormalization: false })
}
