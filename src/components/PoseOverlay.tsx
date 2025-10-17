import { useEffect, useRef } from 'react'
import { Pose } from '@/state/useStore'
import { getKeypointOrder } from '@/lib/mapping'

interface PoseOverlayProps {
  pose: Pose | null
  trackingLost: boolean
  videoRef: React.RefObject<HTMLVideoElement | null>
  className?: string
}

export function PoseOverlay({ pose, trackingLost, videoRef, className = '' }: PoseOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      if (!pose || trackingLost) return
      
      // Get video dimensions
      const videoRect = video.getBoundingClientRect()
      const videoWidth = video.videoWidth
      const videoHeight = video.videoHeight
      
      // Scale factors
      const scaleX = videoRect.width / videoWidth
      const scaleY = videoRect.height / videoHeight
      
      // Draw keypoints and connections
      const order = getKeypointOrder()
      const keypoints = order.map(name => pose.keypoints.get(name)).filter((kp): kp is NonNullable<typeof kp> => kp !== undefined)
      
      if (keypoints.length !== 6) return
      
      // Sort keypoints by X coordinate (same logic as waveform generation)
      const sortedKeypoints = [...keypoints].sort((a, b) => a.x - b.x)
      
      // Draw connections
      ctx.strokeStyle = '#22c55e' // green-500
      ctx.lineWidth = 2
      ctx.beginPath()
      
      for (let i = 0; i < sortedKeypoints.length; i++) {
        const kp = sortedKeypoints[i]!
        const x = kp.x * videoWidth * scaleX
        const y = kp.y * videoHeight * scaleY
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      
      ctx.stroke()
      
      // Draw keypoint circles
      ctx.fillStyle = '#22c55e'
      for (const kp of sortedKeypoints) {
        if (kp) {
          const x = kp.x * videoWidth * scaleX
          const y = kp.y * videoHeight * scaleY
          
          ctx.beginPath()
          ctx.arc(x, y, 6, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
    
    // Draw on video frame updates
    const handleVideoUpdate = () => {
      draw()
    }
    
    video.addEventListener('loadeddata', handleVideoUpdate)
    video.addEventListener('timeupdate', handleVideoUpdate)
    
    // Initial draw
    draw()
    
    return () => {
      video.removeEventListener('loadeddata', handleVideoUpdate)
      video.removeEventListener('timeupdate', handleVideoUpdate)
    }
  }, [pose, trackingLost, videoRef])
  
  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return
    
    const resizeCanvas = () => {
      const videoRect = video.getBoundingClientRect()
      canvas.width = videoRect.width
      canvas.height = videoRect.height
      canvas.style.width = `${videoRect.width}px`
      canvas.style.height = `${videoRect.height}px`
    }
    
    resizeCanvas()
    
    // Watch for video element size changes
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas()
    })
    resizeObserver.observe(video)
    
    window.addEventListener('resize', resizeCanvas)
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      resizeObserver.disconnect()
    }
  }, [videoRef])
  
  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ transform: 'scaleX(-1)' }} // Mirror to match video
    />
  )
}
