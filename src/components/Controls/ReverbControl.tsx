import { useStore } from '@/state/useStore'

export function ReverbControl() {
  const { reverb, set } = useStore()
  
  const handleReverbChange = (param: 'size' | 'strength', value: number) => {
    set({ reverb: { ...reverb, [param]: value } })
  }
  
  // Map size [0,1] to decay [0.2, 8.0] seconds
  const decayTime = 0.2 + reverb.size * 7.8
  
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm">
      <h3 className="text-lg font-mono font-semibold mb-3">Reverb</h3>
      
      <div className="flex justify-center items-end space-x-8">
        <div className="flex flex-col items-center">
          <label className="text-xs font-medium text-gray-700 mb-2">max</label>
          <div className="h-24 w-24 flex items-center justify-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={reverb.size}
              onChange={(e) => handleReverbChange('size', parseFloat(e.target.value))}
              className="slider-vertical"
            />
          </div>
          <label className="text-xs font-medium text-gray-700 mt-2">size</label>
        </div>
        
        <div className="flex flex-col items-center">
          <label className="text-xs font-medium text-gray-700 mb-2">max</label>
          <div className="h-24 w-24 flex items-center justify-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={reverb.strength}
              onChange={(e) => handleReverbChange('strength', parseFloat(e.target.value))}
              className="slider-vertical"
            />
          </div>
          <label className="text-xs font-medium text-gray-700 mt-2">strength</label>
        </div>
      </div>
    </div>
  )
}
