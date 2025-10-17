import { Pose } from '@/state/useStore'
import { REQUIRED_KEYPOINTS } from '@/lib/mapping'

interface PoseDiagnosticsProps {
  pose: Pose | null
  trackingLost: boolean
}

export function PoseDiagnostics({ pose, trackingLost }: PoseDiagnosticsProps) {
  if (trackingLost || !pose) {
    return (
      <div className="text-xs text-gray-500 font-mono">
        <div>Pose Detection: Lost</div>
        <div>Keypoints: 0/6</div>
      </div>
    )
  }

  const keypoints = pose.keypoints
  const validKeypoints = REQUIRED_KEYPOINTS.filter(name => keypoints.has(name))
  
  // Create display names for keypoints
  const displayNames: Record<string, string> = {
    'left_shoulder': 'L.Shoulder',
    'right_shoulder': 'R.Shoulder', 
    'left_elbow': 'L.Elbow',
    'right_elbow': 'R.Elbow',
    'left_wrist': 'L.Hand',
    'right_wrist': 'R.Hand'
  }

  return (
    <div className="text-xs text-gray-500 font-mono space-y-1">
      <div className="flex justify-between">
        <span>Pose Detection: Active</span>
        <span>Keypoints: {validKeypoints.length}/6</span>
      </div>
      <div className="grid grid-cols-6 gap-x-2">
        {REQUIRED_KEYPOINTS.map(name => {
          const keypoint = keypoints.get(name)
          const isValid = keypoint !== undefined
          const visibility = keypoint?.score || 0
          const displayName = displayNames[name]
          
          return (
            <div key={name} className={`text-center ${isValid ? 'text-gray-700' : 'text-gray-400'}`}>
              <div className="text-xs font-semibold">{displayName}</div>
              <div className="text-xs">{isValid ? `${(visibility * 100).toFixed(0)}%` : '--'}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
