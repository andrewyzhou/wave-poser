import { useStore } from '@/state/useStore'

export function VolumeControl() {
  const { volumeDb, set } = useStore()
  
  const handleVolumeChange = (value: number) => {
    set({ volumeDb: value })
  }
  
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm">
      <h3 className="text-lg font-mono font-semibold mb-3">Volume</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Volume: {volumeDb.toFixed(1)} dB
          </label>
          <input
            type="range"
            min="-60"
            max="0"
            step="0.1"
            value={volumeDb}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>
    </div>
  )
}
