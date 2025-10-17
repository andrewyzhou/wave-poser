'use client'

import { useEffect, useState } from 'react'
import { TitleBar } from '@/components/TitleBar'
import { Section } from '@/components/Section'
import { CameraFeed } from '@/components/CameraFeed'
import { PoseOverlay } from '@/components/PoseOverlay'
import { PoseDiagnostics } from '@/components/PoseDiagnostics'
import { WaveCanvas } from '@/components/WaveCanvas'
import { WaveformModeSelector } from '@/components/Controls/WaveformModeSelector'
import { PitchControl } from '@/components/Controls/PitchControl'
import { DistortionControl } from '@/components/Controls/DistortionControl'
import { SaturationControl } from '@/components/Controls/SaturationControl'
import { EQControl } from '@/components/Controls/EQControl'
import { ReverbControl } from '@/components/Controls/ReverbControl'
import { VolumeControl } from '@/components/Controls/VolumeControl'
import { usePoseDetector } from '@/hooks/usePoseDetector'
import { useWaveTable } from '@/hooks/useWaveTable'
import { useAudioEngine } from '@/hooks/useAudioEngine'
import { useStore } from '@/state/useStore'

export default function Home() {
  const [isStarted, setIsStarted] = useState(false)
  const [showLanding, setShowLanding] = useState(true)
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'pending'>('pending')
  
  const { waveformMode } = useStore()
  const { pose, trackingLost, start: startPose, videoRef } = usePoseDetector(waveformMode === 'camera')
  const { waveTable } = useWaveTable(waveformMode === 'camera' ? pose : null)
  const audioEngine = useAudioEngine()
  
  const { 
    freqHz, 
    distortion, 
    saturation, 
    eq, 
    reverb, 
    volumeDb,
    setPose,
    setTrackingLost,
    setWaveTable
  } = useStore()
  
  // Update global state when pose changes
  useEffect(() => {
    setPose(pose)
    setTrackingLost(trackingLost)
  }, [pose, trackingLost, setPose, setTrackingLost])
  
  // Update global state when wave table changes
  useEffect(() => {
    if (waveTable) {
      setWaveTable(waveTable)
    }
  }, [waveTable, setWaveTable])
  
  // Update audio engine when controls change
  useEffect(() => {
    if (audioEngine.isStarted) {
      audioEngine.setFrequency(freqHz)
    }
  }, [freqHz, audioEngine])
  
  useEffect(() => {
    if (audioEngine.isStarted) {
      audioEngine.setDistortion(distortion)
    }
  }, [distortion, audioEngine])
  
  useEffect(() => {
    if (audioEngine.isStarted) {
      audioEngine.setSaturation(saturation)
    }
  }, [saturation, audioEngine])
  
  useEffect(() => {
    if (audioEngine.isStarted) {
      audioEngine.setEQ(eq.low, eq.mid, eq.high)
    }
  }, [eq, audioEngine])
  
  useEffect(() => {
    if (audioEngine.isStarted) {
      audioEngine.setReverb(reverb.size, reverb.strength)
    }
  }, [reverb, audioEngine])
  
  useEffect(() => {
    if (audioEngine.isStarted) {
      audioEngine.setVolume(volumeDb)
    }
  }, [volumeDb, audioEngine])
  
  // Update waveform in audio engine
  useEffect(() => {
    if (waveTable && audioEngine.isStarted) {
      if (waveformMode === 'camera') {
        // Reset to camera mode when switching to camera
        audioEngine.resetToCameraMode()
        
        // Camera mode: crossfading every 5 seconds
        const intervalId = setInterval(() => {
          audioEngine.updateWave(waveTable, true) // isCameraMode = true
        }, 5000) // Update every 5 seconds
        
        // Update immediately on first load
        audioEngine.updateWave(waveTable, true) // isCameraMode = true
        
        return () => clearInterval(intervalId)
      } else {
        // Reset to default mode when switching to default modes
        audioEngine.resetToDefaultMode()
        
        // Default modes: immediate update, no crossfading
        audioEngine.updateWave(waveTable, false) // isCameraMode = false
      }
    }
  }, [waveTable, audioEngine, waveformMode]) // Update when waveform changes
  
  const handleStart = async () => {
    try {
      await startPose()
      await audioEngine.start()
      setIsStarted(true)
      setCameraPermission('granted')
    } catch (error) {
      console.error('Failed to start:', error)
      setCameraPermission('denied')
    }
  }

  const handleLandingClick = () => {
    setShowLanding(false)
    setTimeout(() => {
      handleStart()
    }, 500) // Start after animation
  }
  
  // Add animation complete classes BEFORE animations end to prevent disappearing
  useEffect(() => {
    if (showLanding) {
      const timeouts = [
        // Title animation: add class at 1.4s (100ms before 1.5s animation ends)
        setTimeout(() => {
          const titleEl = document.querySelector('.animate-titleEntrance')
          if (titleEl) titleEl.classList.add('animation-complete')
        }, 500),
        
        // First bullet: add class at 2.2s (100ms before 2.3s animation ends)
        setTimeout(() => {
          const firstBullet = document.querySelector('.bullet-1')
          if (firstBullet) firstBullet.classList.add('animation-complete')
        }, 1300),
        
        // Second bullet: add class at 2.7s (100ms before 2.8s animation ends)
        setTimeout(() => {
          const secondBullet = document.querySelector('.bullet-2')
          if (secondBullet) secondBullet.classList.add('animation-complete')
        }, 1800),
        
        // Third bullet: add class at 3.2s (100ms before 3.3s animation ends)
        setTimeout(() => {
          const thirdBullet = document.querySelector('.bullet-3')
          if (thirdBullet) thirdBullet.classList.add('animation-complete')
        }, 2300)
      ]
      
      return () => timeouts.forEach(clearTimeout)
    }
  }, [showLanding])
  
  // Fix main page animations disappearing
  useEffect(() => {
    if (!showLanding) {
      const timeouts = [
        // Main page elements animate in after landing page transition
        setTimeout(() => {
          const leftElements = document.querySelectorAll('.animate-slideInLeft')
          const rightElements = document.querySelectorAll('.animate-slideInRight')
          const downElements = document.querySelectorAll('.animate-slideDown')
          
          // Add animation-complete class to all main page elements
          const allElements = Array.from(leftElements).concat(Array.from(rightElements)).concat(Array.from(downElements))
          allElements.forEach(el => {
            if (!el.classList.contains('bullet-1') && 
                !el.classList.contains('bullet-2') && 
                !el.classList.contains('bullet-3')) {
              el.classList.add('animation-complete')
            }
          })
        }, 700) // After main page animations complete
      ]
      
      return () => timeouts.forEach(clearTimeout)
    }
  }, [showLanding])
  
  // Landing page
  if (showLanding) {
  return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: 'var(--title-bg)' }}>
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {/* Floating geometric shapes */}
          <div className="absolute top-20 left-20 w-16 h-16 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute top-40 right-32 w-12 h-12 bg-pink-300 rotate-45 animate-pulse" style={{ animationDelay: '1s', animationDuration: '2s' }}></div>
          <div className="absolute bottom-32 left-40 w-20 h-20 bg-blue-300 rounded-lg animate-spin" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>
          <div className="absolute bottom-20 right-20 w-14 h-14 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}></div>
          
          {/* Wave-like background pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
              <path d="M0,500 Q250,200 500,500 T1000,500 L1000,1000 L0,1000 Z" fill="url(#waveGradient)" />
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="50%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        
        {/* Main content */}
        <div className="text-center z-10 relative">
          {/* Animated title with multiple effects */}
          <div className="mb-8">
            <h1 className="text-8xl font-mono font-bold mb-4 animate-titleEntrance" style={{ 
              background: 'linear-gradient(45deg, #8B5CF6, #EC4899, #3B82F6)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradientShift 3s ease-in-out infinite, titleEntrance 1.5s ease-out'
            }}>
              WavePose
            </h1>
            
            {/* Subtitle with typewriter effect */}
            <div className="text-2xl text-gray-600 font-mono">
              <span className="animate-fadeIn" style={{ animationDelay: '1s' }}>
                Transform your body into sound
              </span>
            </div>
            
            {/* Feature highlights */}
            <div className="mt-8 space-y-2 text-lg text-gray-500">
              <div className="animate-slideInLeft bullet-1" style={{ animationDelay: '1.5s' }}>
                🎵 Real-time pose detection
              </div>
              <div className="animate-slideInRight bullet-2" style={{ animationDelay: '2s' }}>
                🎨 Live waveform visualization
              </div>
              <div className="animate-slideInLeft bullet-3" style={{ animationDelay: '2.5s' }}>
                🔊 Interactive audio synthesis
              </div>
            </div>
          </div>
          
          {/* Enhanced button with hover effects */}
          <button
            onClick={handleLandingClick}
            className="group relative bg-black hover:bg-gray-800 text-white font-mono font-semibold px-12 py-6 rounded-xl text-xl transition-all duration-500 transform hover:scale-110 hover:shadow-2xl overflow-hidden"
          >
            {/* Button background animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Button text */}
            <span className="relative z-10">Click to Begin</span>
            
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 group-hover:animate-ping"></div>
            </div>
          </button>
          
          {/* Loading indicator */}
          <div className="mt-8 animate-bounce">
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Title Section */}
      <div className="w-full py-2 animate-slideDown" style={{ backgroundColor: 'var(--title-bg)' }}>
        <div className="container mx-auto px-4">
          <TitleBar />
        </div>
      </div>
      
      {/* Main Content - Full Width */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] min-h-screen">
        {/* Left Column - Waveform Section */}
        <div className="p-6 animate-slideInLeft" style={{ backgroundColor: 'var(--waveform-bg)' }}>
          <h2 className="text-2xl font-mono font-bold mb-6 text-center">waveform</h2>
          <div className="space-y-6">
            {/* Camera Feed */}
            <div className="relative border-2 border-black rounded-lg overflow-hidden">
              <CameraFeed ref={videoRef} />
              <PoseOverlay 
                pose={pose} 
                trackingLost={trackingLost} 
                videoRef={videoRef} 
              />
              {trackingLost && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
                  Tracking Lost
                </div>
              )}
            </div>
            
            {/* Pose Diagnostics */}
            <PoseDiagnostics pose={pose} trackingLost={trackingLost} />
            
            {/* Wave Visualizer */}
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <WaveCanvas 
                waveTable={waveTable} 
                isDefaultWave={waveformMode !== 'camera' || !pose || pose.keypoints.size !== 6}
                waveformMode={waveformMode}
              />
            </div>
            
            {/* Start Button */}
            {!isStarted && (
              <div className="text-center">
                <button
                  onClick={handleStart}
                  className="bg-green-500 hover:bg-green-600 text-white font-mono font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
                >
                  Start Audio
                </button>
              </div>
            )}
            
            {/* Camera Permission Error */}
            {cameraPermission === 'denied' && (
              <div className="text-center p-4 bg-red-100 rounded-lg">
                <p className="text-red-800 font-mono">
                  Camera permission denied. Please allow camera access to use WavePose.
                </p>
                <button
                  onClick={handleStart}
                  className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-mono px-4 py-2 rounded transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column - Options Section */}
        <div className="p-6 animate-slideInRight" style={{ backgroundColor: 'var(--options-bg)' }}>
          <h2 className="text-2xl font-mono font-bold mb-6 text-center">options</h2>
          <div className="space-y-4">
            {/* Waveform Mode Selector - Full Width */}
            <WaveformModeSelector />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PitchControl />
              <DistortionControl />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SaturationControl />
              <VolumeControl />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EQControl />
              <ReverbControl />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}