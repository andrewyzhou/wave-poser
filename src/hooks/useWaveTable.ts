import { useEffect, useRef, useCallback, useState } from 'react'
import { Pose, useStore } from '@/state/useStore'
import { pointsToWaveTable, generateWaveform } from '@/lib/waveform'

export interface UseWaveTableReturn {
  waveTable: Float32Array | null
  lastUpdate: number
}

export function useWaveTable(pose: Pose | null, updateRateHz = 2): UseWaveTableReturn {
  const { waveformMode } = useStore()
  const [waveTable, setWaveTable] = useState<Float32Array | null>(null)
  const [lastUpdate, setLastUpdate] = useState(0)
  
  const lastUpdateTimeRef = useRef(0)
  const lastTableRef = useRef<Float32Array | null>(null)
  
  const updateWaveTable = useCallback((newPose: Pose) => {
    const now = Date.now()
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current
    const updateInterval = 1000 / updateRateHz
    
    if (timeSinceLastUpdate >= updateInterval) {
      try {
        const newTable = pointsToWaveTable(newPose.keypoints)
        setWaveTable(newTable)
        setLastUpdate(now)
        lastUpdateTimeRef.current = now
        lastTableRef.current = newTable
      } catch (error) {
        console.error('Failed to generate wave table:', error)
        // Keep using the last valid table
        if (lastTableRef.current) {
          setWaveTable(lastTableRef.current)
        }
      }
    }
  }, [updateRateHz])
  
  // Generate waveform based on mode
  useEffect(() => {
    if (waveformMode === 'camera') {
      // Camera mode - will be handled by separate effect
      return
    } else {
      // Generate static waveform for non-camera modes
      // Only update if mode actually changed to prevent constant updates
      const newTable = generateWaveform(waveformMode)
      setWaveTable(newTable)
      setLastUpdate(Date.now())
    }
  }, [waveformMode]) // Only depend on waveformMode - no pose tracking for default modes
  
  // Separate effect for camera mode pose updates
  useEffect(() => {
    if (waveformMode === 'camera' && pose) {
      updateWaveTable(pose)
    }
  }, [waveformMode, pose, updateWaveTable]) // Only for camera mode
  
  return {
    waveTable,
    lastUpdate
  }
}
