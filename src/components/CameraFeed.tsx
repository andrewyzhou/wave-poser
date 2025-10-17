import { forwardRef } from 'react'

interface CameraFeedProps {
  className?: string
}

export const CameraFeed = forwardRef<HTMLVideoElement, CameraFeedProps>(
  ({ className = '' }, ref) => {
    return (
      <video
        ref={ref}
        className={`w-full h-auto rounded-lg ${className}`}
        playsInline
        muted
        style={{ transform: 'scaleX(-1)' }} // Mirror the video
      />
    )
  }
)

CameraFeed.displayName = 'CameraFeed'
