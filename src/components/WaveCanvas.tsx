import { useEffect, useRef, useCallback } from 'react'

interface WaveCanvasProps {
  waveTable: Float32Array | null
  className?: string
  isDefaultWave?: boolean
  waveformMode?: 'camera' | 'sine' | 'saw' | 'square'
}

export function WaveCanvas({ waveTable, className = '', isDefaultWave = false, waveformMode = 'camera' }: WaveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const offsetRef = useRef(0)
  const lastTableRef = useRef<Float32Array | null>(null)
  const mirroredTableRef = useRef<Float32Array | null>(null)
  const isVisibleRef = useRef(true)
  
  const scrollSpeed = 96 // samples per frame
  
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const { width, height } = canvas
    const centerY = height / 2
    const amplitude = height * 0.4 // Reasonable amplitude
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Use current or last valid table
    const currentTable = waveTable || lastTableRef.current
    if (!currentTable) return
    
    // Use the original table directly (no mirroring for now)
    if (currentTable !== lastTableRef.current) {
      mirroredTableRef.current = currentTable
      lastTableRef.current = currentTable
    }
    
    const mirroredTable = mirroredTableRef.current
    if (!mirroredTable) return
    
    // Draw waveform
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.beginPath()
    
    const tableLength = mirroredTable.length
    const samplesPerPixel = tableLength / width
    
    for (let x = 0; x < width; x++) {
      const sampleIndex = Math.floor((offsetRef.current + x * samplesPerPixel) % tableLength)
      const sample = mirroredTable[sampleIndex]
      // Convert from -0.5 to 0.5 range to 0 to 1 range, then to canvas coordinates
      const normalizedSample = (sample + 0.5) // Convert -0.5,0.5 to 0,1
      const y = centerY - (normalizedSample - 0.5) * amplitude * 2 // Convert 0,1 to -amplitude,+amplitude around center
      
      if (x === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    
    ctx.stroke()
    
    // Draw center line (y=0.5 reference line)
    ctx.strokeStyle = '#ff0000'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, centerY)
    ctx.lineTo(width, centerY)
    ctx.stroke()
    
    // Update scroll offset
    offsetRef.current += scrollSpeed
    if (offsetRef.current >= tableLength) {
      offsetRef.current = 0
    }
  }, [waveTable])
  
  const animate = useCallback(() => {
    if (!isVisibleRef.current) return
    
    draw()
    animationFrameRef.current = requestAnimationFrame(animate)
  }, [draw])
  
  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden
      if (isVisibleRef.current && !animationFrameRef.current) {
        animate()
      } else if (!isVisibleRef.current && animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [animate])
  
  // Start animation
  useEffect(() => {
    if (isVisibleRef.current) {
      animate()
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [animate])
  
  // Handle canvas resize
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      }
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])
  
  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className={`w-full h-30 lg:h-48 ${className}`}
        style={{ willChange: 'transform' }}
      />
      {isDefaultWave && (
        <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded text-sm font-mono">
          {waveformMode === 'camera' ? 'Default Sine Wave' : `${waveformMode.charAt(0).toUpperCase() + waveformMode.slice(1)} Wave`}
        </div>
      )}
    </div>
  )
}