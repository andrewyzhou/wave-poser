import { useEffect, useRef, useState, useCallback } from 'react'
import { Pose, Keypoint } from '@/state/useStore'
import { REQUIRED_KEYPOINTS, smooth } from '@/lib/mapping'

export interface UsePoseDetectorReturn {
  pose: Pose | null
  trackingLost: boolean
  isInitialized: boolean
  start: () => Promise<void>
  stop: () => void
  videoRef: React.RefObject<HTMLVideoElement | null>
}

// MediaPipe keypoint mapping to our required keypoints
// MediaPipe PoseLandmarker has 33 keypoints (0-32)
const MEDIAPIPE_KEYPOINT_MAP: Record<string, number> = {
  left_shoulder: 11,   // Left shoulder
  right_shoulder: 12,  // Right shoulder
  left_elbow: 13,      // Left elbow
  right_elbow: 14,     // Right elbow
  left_wrist: 15,      // Left wrist
  right_wrist: 16,     // Right wrist
}

export function usePoseDetector(shouldDetect: boolean = true): UsePoseDetectorReturn {
  const [pose, setPose] = useState<Pose | null>(null)
  const [trackingLost, setTrackingLost] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const landmarkerRef = useRef<{ detectForVideo: (videoElement: HTMLVideoElement, timestamp: number) => { landmarks?: Array<Array<{ x: number; y: number; z: number; visibility?: number }>> } } | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const lastPoseRef = useRef<Map<string, { x: number; y: number }>>(new Map())
  const lostFramesRef = useRef(0)

  const initializeDetector = useCallback(async () => {
    try {
      // Dynamic import to ensure it only runs on client side
      const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')

      // Initialize MediaPipe
      const fileset = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      )

      const landmarker = await PoseLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"
        },
        runningMode: "VIDEO"
      })

      landmarkerRef.current = landmarker
      setIsInitialized(true)
      console.log('MediaPipe PoseLandmarker initialized successfully')
    } catch (error) {
      console.error('Failed to initialize MediaPipe PoseLandmarker:', error)
      setIsInitialized(false)
    }
  }, [])

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 360 },
          facingMode: 'user'
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.playsInline = true
        
        // Add error handling for play() method
        try {
          await videoRef.current.play()
        } catch (playError) {
          console.log('Video play interrupted, retrying...', playError)
          // Retry play after a short delay
          setTimeout(async () => {
            try {
              await videoRef.current?.play()
            } catch (retryError) {
              console.log('Video play retry failed:', retryError)
            }
          }, 100)
        }
        
        streamRef.current = stream
      }
    } catch (error) {
      console.error('Failed to start camera:', error)
      throw error
    }
  }, [])

  const detectPose = useCallback(async () => {
    if (!landmarkerRef.current || !videoRef.current || !shouldDetect) {
      if (shouldDetect) {
        animationFrameRef.current = requestAnimationFrame(detectPose)
      }
      return
    }

    try {
      let result
      try {
        // Try using HTMLVideoElement directly - some MediaPipe versions support this
        result = landmarkerRef.current.detectForVideo(videoRef.current, performance.now())
      } catch (methodError) {
        console.log('detectForVideo with HTMLVideoElement failed:', methodError)
        result = null
      }

      if (result && result.landmarks && result.landmarks.length > 0) {
        const landmarks = result.landmarks[0] // Get first person
        const keypoints = new Map<string, Keypoint>()

        // Debug: Log all available landmarks
        console.log('Available landmarks:', landmarks.length)
        console.log('Landmark visibility scores:', landmarks.map((l, i) => `${i}: ${l.visibility || 0}`))

        // Extract required keypoints from MediaPipe landmarks
        let validKeypointsCount = 0
        for (const name of REQUIRED_KEYPOINTS) {
          const mediapipeIndex = MEDIAPIPE_KEYPOINT_MAP[name]
          if (mediapipeIndex !== undefined && landmarks[mediapipeIndex]) {
            const landmark = landmarks[mediapipeIndex]
            const x = landmark.x
            const y = landmark.y
            const score = landmark.visibility || 0.5 // Use visibility as confidence

            console.log(`${name} (index ${mediapipeIndex}): visibility=${score}, x=${x}, y=${y}`)

            if (score >= 0.3) { // Lower threshold for better detection
              // Apply smoothing
              const lastPos = lastPoseRef.current.get(name)
              if (lastPos) {
                const smoothed = smooth(lastPos, { x, y }, 0.5)
                keypoints.set(name, {
                  x: smoothed.x,
                  y: smoothed.y,
                  score
                })
                lastPoseRef.current.set(name, smoothed)
              } else {
                keypoints.set(name, {
                  x,
                  y,
                  score
                })
                lastPoseRef.current.set(name, { x, y })
              }
              validKeypointsCount++
            } else {
              console.log(`${name} below visibility threshold: ${score}`)
            }
          } else {
            console.log(`${name} not found at index ${mediapipeIndex}`)
          }
        }

        console.log(`Valid keypoints: ${validKeypointsCount}/${REQUIRED_KEYPOINTS.length}`)

        // Require at least 4 out of 6 keypoints for partial tracking
        if (validKeypointsCount >= 4) {
          setPose({ keypoints })
          setTrackingLost(false)
          lostFramesRef.current = 0
        } else {
          lostFramesRef.current++
          if (lostFramesRef.current >= 10) {
            setTrackingLost(true)
            setPose(null)
          }
        }
      } else {
        lostFramesRef.current++
        if (lostFramesRef.current >= 10) {
          setTrackingLost(true)
          setPose(null)
        }
      }
    } catch (error) {
      console.error('Pose detection error:', error)
      setTrackingLost(true)
      setPose(null)
    }

    animationFrameRef.current = requestAnimationFrame(detectPose)
  }, [shouldDetect])

  const start = useCallback(async () => {
    try {
      if (!isInitialized) {
        await initializeDetector()
      }
      await startCamera()
      if (landmarkerRef.current) {
        animationFrameRef.current = requestAnimationFrame(detectPose)
      }
    } catch (error) {
      console.error('Failed to start pose detection:', error)
      throw error
    }
  }, [isInitialized, initializeDetector, startCamera, detectPose])

  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setPose(null)
    setTrackingLost(false)
  }, [])

  // Effect to control detection based on shouldDetect parameter
  useEffect(() => {
    if (!shouldDetect) {
      // Stop detection when shouldDetect is false
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      setPose(null)
      setTrackingLost(false)
    } else if (shouldDetect && landmarkerRef.current && videoRef.current) {
      // Restart detection when shouldDetect becomes true
      animationFrameRef.current = requestAnimationFrame(detectPose)
    }
  }, [shouldDetect, detectPose])

  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])
  
  return {
    pose,
    trackingLost,
    isInitialized,
    start,
    stop,
    videoRef
  }
}