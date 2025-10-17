import { useRef, useCallback, useEffect } from 'react'
import * as Tone from 'tone'
// import { createPeriodicWaveFromSamples } from '@/lib/dft' // Temporarily disabled

export interface AudioEngine {
  start: () => Promise<void>
  setFrequency: (hz: number) => void
  setDistortion: (drive: number) => void
  setSaturation: (amount: number) => void
  setEQ: (low: number, mid: number, high: number) => void
  setReverb: (size: number, strength: number) => void
  setVolume: (db: number) => void
  updateWave: (table: Float32Array, isCameraMode?: boolean) => void
  resetToCameraMode: () => void
  resetToDefaultMode: () => void
  isStarted: boolean
}

export function useAudioEngine(): AudioEngine {
  const isStartedRef = useRef(false)
  
  // Dual audio engine setup for camera mode
  const oscARef = useRef<Tone.Oscillator | null>(null)
  const oscBRef = useRef<Tone.Oscillator | null>(null)
  const oscAVolumeRef = useRef<Tone.Volume | null>(null)
  const oscBVolumeRef = useRef<Tone.Volume | null>(null)
  const activeOscRef = useRef<'A' | 'B'>('A')
  
  // Single oscillator for default modes
  const singleOscRef = useRef<Tone.Oscillator | null>(null)
  
  // Effects chain
  const distortionRef = useRef<Tone.Distortion | null>(null)
  const saturationRef = useRef<Tone.WaveShaper | null>(null)
  const saturationGainRef = useRef<Tone.Gain | null>(null)
  const eqRef = useRef<Tone.EQ3 | null>(null)
  const reverbRef = useRef<Tone.Reverb | null>(null)
  const volumeRef = useRef<Tone.Volume | null>(null)
  
  const initializeAudio = useCallback(() => {
    if (isStartedRef.current) return
    
    // Create effects chain
    distortionRef.current = new Tone.Distortion({
      distortion: 0,
      oversample: '4x'
    })
    
    // Saturation using WaveShaper with tanh curve
    saturationRef.current = new Tone.WaveShaper((x) => Math.tanh(x))
    saturationGainRef.current = new Tone.Gain(1)
    
    eqRef.current = new Tone.EQ3({
      low: 0,
      mid: 0,
      high: 0,
      lowFrequency: 100,
      highFrequency: 2500
    })
    
    reverbRef.current = new Tone.Reverb({
      decay: 2.0,
      preDelay: 0.01
    })
    
    volumeRef.current = new Tone.Volume(-9)
    
    // Create volume controls for dual oscillators
    oscAVolumeRef.current = new Tone.Volume(0) // Start A at full volume
    oscBVolumeRef.current = new Tone.Volume(-Infinity) // Start B at 0 volume
    
    // Create dual oscillators for camera mode
    oscARef.current = new Tone.Oscillator(220, 'sine')
    oscBRef.current = new Tone.Oscillator(220, 'sine')
    
    // Create single oscillator for default modes
    singleOscRef.current = new Tone.Oscillator(220, 'sine')
    
    // Connect dual oscillator setup (camera mode)
    oscARef.current.connect(oscAVolumeRef.current)
    oscBRef.current.connect(oscBVolumeRef.current)
    oscAVolumeRef.current.connect(distortionRef.current)
    oscBVolumeRef.current.connect(distortionRef.current)
    
    // Connect single oscillator setup (default modes)
    singleOscRef.current.connect(distortionRef.current)
    
    // Effects chain (shared)
    distortionRef.current.connect(saturationGainRef.current)
    saturationGainRef.current.connect(saturationRef.current)
    saturationRef.current.connect(eqRef.current)
    eqRef.current.connect(reverbRef.current)
    reverbRef.current.connect(volumeRef.current)
    volumeRef.current.toDestination()
    
    isStartedRef.current = true
  }, [])
  
  const start = useCallback(async () => {
    if (isStartedRef.current) return
    
    try {
      // Small delay to ensure Next.js has finished initial compilation
      await new Promise(resolve => setTimeout(resolve, 100))
      
      await Tone.start()
      initializeAudio()
      
      // Only start the single oscillator initially (for default modes)
      // Dual oscillators will be started when needed for camera mode
      if (singleOscRef.current) {
        singleOscRef.current.start()
      }
      
      console.log('Audio engine started successfully')
    } catch (error) {
      console.error('Failed to start audio engine:', error)
    }
  }, [initializeAudio])
  
  const setFrequency = useCallback((hz: number) => {
    if (oscARef.current && oscBRef.current && singleOscRef.current) {
      oscARef.current.frequency.value = hz
      oscBRef.current.frequency.value = hz
      singleOscRef.current.frequency.value = hz
    }
  }, [])
  
  const setDistortion = useCallback((drive: number) => {
    if (distortionRef.current) {
      distortionRef.current.distortion = drive
    }
  }, [])
  
  const setSaturation = useCallback((amount: number) => {
    if (saturationGainRef.current) {
      // Map amount [0,1] to gain [1, 20] for more dramatic effect
      const gain = 1 + amount * 19
      saturationGainRef.current.gain.value = gain
    }
  }, [])
  
  const setEQ = useCallback((low: number, mid: number, high: number) => {
    if (eqRef.current) {
      eqRef.current.low.value = low
      eqRef.current.mid.value = mid
      eqRef.current.high.value = high
    }
  }, [])
  
  const setReverb = useCallback((size: number, strength: number) => {
    if (reverbRef.current) {
      // Map size [0,1] to decay [0.2, 8.0] seconds
      const decay = 0.2 + size * 7.8
      reverbRef.current.decay = decay
      reverbRef.current.wet.value = strength
    }
  }, [])
  
  const setVolume = useCallback((db: number) => {
    if (volumeRef.current) {
      volumeRef.current.volume.value = db
    }
  }, [])
  
  const updateWave = useCallback((table: Float32Array, isCameraMode = false) => {
    if (!isStartedRef.current) {
      console.warn('Audio engine not started, skipping waveform update')
      return
    }
    
    if (isCameraMode && (!oscARef.current || !oscBRef.current || !oscAVolumeRef.current || !oscBVolumeRef.current)) {
      console.warn('Camera mode oscillators not ready, skipping update')
      return
    }
    if (!isCameraMode && !singleOscRef.current) {
      console.warn('Default mode oscillator not ready, skipping update')
      return
    }
    
    try {
      // Convert time domain waveform to frequency domain partials using DFT
      const partials: number[] = []
      for (let harmonic = 1; harmonic <= 32; harmonic++) {
        let real = 0
        let imag = 0
        for (let i = 0; i < table.length; i++) {
          const angle = (2 * Math.PI * harmonic * i) / table.length
          const sample = table[i] // Already in -0.5 to 0.5 range
          real += sample * Math.cos(angle)
          imag += sample * Math.sin(angle)
        }
        const amplitude = Math.sqrt(real * real + imag * imag) / table.length
        partials.push(amplitude)
      }
      
      if (isCameraMode) {
        // Camera mode: use volume-based crossfading
        console.log('Camera mode: Volume-based crossfading to new waveform')
        
        if (!oscARef.current || !oscBRef.current || !oscAVolumeRef.current || !oscBVolumeRef.current) return
        
        // Start dual oscillators if they're not already started
        if (oscARef.current.state !== 'started') {
          oscARef.current.start()
        }
        if (oscBRef.current.state !== 'started') {
          oscBRef.current.start()
        }
        
        const fadeTime = 5.0 // 5 second crossfade
        
        if (activeOscRef.current === 'A') {
          // Currently A is playing at 100%, B at 0%
          // Update oscillator B with new waveform while it's silent
          const currentFreq = oscBRef.current.frequency.value
          oscBRef.current.stop()
          oscBRef.current.dispose()
          oscBRef.current = new Tone.Oscillator({
            frequency: currentFreq,
            type: 'custom',
            partials: partials
          })
          oscBRef.current.connect(oscBVolumeRef.current)
          oscBRef.current.start()
          
          // Now fade from A (100%) to B (0% -> 100%)
          // A fades from 0dB to -Infinity, B fades from -Infinity to 0dB
          oscAVolumeRef.current.volume.rampTo(-Infinity, fadeTime)
          oscBVolumeRef.current.volume.rampTo(0, fadeTime)
          
          // Switch to B after fade
          setTimeout(() => {
            activeOscRef.current = 'B'
          }, fadeTime * 1000)
        } else {
          // Currently B is playing at 100%, A at 0%
          // Update oscillator A with new waveform while it's silent
          const currentFreq = oscARef.current.frequency.value
          oscARef.current.stop()
          oscARef.current.dispose()
          oscARef.current = new Tone.Oscillator({
            frequency: currentFreq,
            type: 'custom',
            partials: partials
          })
          oscARef.current.connect(oscAVolumeRef.current)
          oscARef.current.start()
          
          // Now fade from B (100%) to A (0% -> 100%)
          // B fades from 0dB to -Infinity, A fades from -Infinity to 0dB
          oscBVolumeRef.current.volume.rampTo(-Infinity, fadeTime)
          oscAVolumeRef.current.volume.rampTo(0, fadeTime)
          
          // Switch to A after fade
          setTimeout(() => {
            activeOscRef.current = 'A'
          }, fadeTime * 1000)
        }
      } else {
        // Default mode: simple single oscillator update (no crossfading)
        console.log('Default mode: Updating single oscillator')
        
        // Update single oscillator with new waveform
        if (!singleOscRef.current) return
        
        const currentFreq = singleOscRef.current.frequency.value
        singleOscRef.current.stop()
        singleOscRef.current.dispose()
        singleOscRef.current = new Tone.Oscillator({
          frequency: currentFreq,
          type: 'custom',
          partials: partials
        })
        
        // Reconnect to effects chain
        singleOscRef.current.connect(distortionRef.current!)
        singleOscRef.current.start()
      }
      
    } catch (error) {
      console.error('Failed to update waveform:', error)
      console.log('Falling back to default sine wave')
    }
  }, [])
  
  const resetToCameraMode = useCallback(() => {
    if (!isStartedRef.current) return
    
    console.log('Resetting to camera mode')
    
    // Stop single oscillator
    if (singleOscRef.current) {
      singleOscRef.current.stop()
    }
    
    // Reset dual oscillator volumes
    if (oscAVolumeRef.current && oscBVolumeRef.current) {
      oscAVolumeRef.current.volume.value = 0 // A at full volume
      oscBVolumeRef.current.volume.value = -Infinity // B at 0 volume
    }
    
    // Reset active oscillator
    activeOscRef.current = 'A'
  }, [])
  
  const resetToDefaultMode = useCallback(() => {
    if (!isStartedRef.current) return
    
    console.log('Resetting to default mode')
    
    // Stop dual oscillators
    if (oscARef.current) {
      oscARef.current.stop()
    }
    if (oscBRef.current) {
      oscBRef.current.stop()
    }
    
    // Reset dual oscillator volumes to silent
    if (oscAVolumeRef.current && oscBVolumeRef.current) {
      oscAVolumeRef.current.volume.value = -Infinity
      oscBVolumeRef.current.volume.value = -Infinity
    }
  }, [])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        // Stop all oscillators first
        if (oscARef.current) {
          oscARef.current.stop()
          oscARef.current.dispose()
        }
        if (oscBRef.current) {
          oscBRef.current.stop()
          oscBRef.current.dispose()
        }
        if (oscAVolumeRef.current) {
          oscAVolumeRef.current.dispose()
        }
        if (oscBVolumeRef.current) {
          oscBVolumeRef.current.dispose()
        }
        if (singleOscRef.current) {
          singleOscRef.current.stop()
          singleOscRef.current.dispose()
        }
        
        // Dispose effects
        if (distortionRef.current) {
          distortionRef.current.dispose()
        }
        if (saturationRef.current) {
          saturationRef.current.dispose()
        }
        if (saturationGainRef.current) {
          saturationGainRef.current.dispose()
        }
        if (eqRef.current) {
          eqRef.current.dispose()
        }
        if (reverbRef.current) {
          reverbRef.current.dispose()
        }
        if (volumeRef.current) {
          volumeRef.current.dispose()
        }
        
        // Reset state
        isStartedRef.current = false
        
        console.log('Audio engine cleaned up')
      } catch (error) {
        console.error('Error during audio cleanup:', error)
      }
    }
  }, [])
  
  return {
    start,
    setFrequency,
    setDistortion,
    setSaturation,
    setEQ,
    setReverb,
    setVolume,
    updateWave,
    resetToCameraMode,
    resetToDefaultMode,
    isStarted: isStartedRef.current
  }
}
