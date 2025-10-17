import { useStore } from '@/state/useStore'

export function EQControl() {
  const { eq, set } = useStore()
  
  const handleEQChange = (band: 'low' | 'mid' | 'high', value: number) => {
    set({ eq: { ...eq, [band]: value } })
  }
  
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm">
      <h3 className="text-lg font-mono font-semibold mb-3">Equalizer</h3>
      
      <div className="flex justify-center items-end space-x-4">
        <div className="flex flex-col items-center">
          <label className="text-xs font-medium text-gray-700 mb-2">max</label>
          <div className="h-24 w-24 flex items-center justify-center">
            <input
              type="range"
              min="-12"
              max="12"
              step="0.1"
              value={eq.low}
              onChange={(e) => handleEQChange('low', parseFloat(e.target.value))}
              className="slider-vertical"
            />
          </div>
          <label className="text-xs font-medium text-gray-700 mt-2">lows</label>
        </div>
        
        <div className="flex flex-col items-center">
          <label className="text-xs font-medium text-gray-700 mb-2">max</label>
          <div className="h-24 w-24 flex items-center justify-center">
            <input
              type="range"
              min="-12"
              max="12"
              step="0.1"
              value={eq.mid}
              onChange={(e) => handleEQChange('mid', parseFloat(e.target.value))}
              className="slider-vertical"
            />
          </div>
          <label className="text-xs font-medium text-gray-700 mt-2">mids</label>
        </div>
        
        <div className="flex flex-col items-center">
          <label className="text-xs font-medium text-gray-700 mb-2">max</label>
          <div className="h-24 w-24 flex items-center justify-center">
            <input
              type="range"
              min="-12"
              max="12"
              step="0.1"
              value={eq.high}
              onChange={(e) => handleEQChange('high', parseFloat(e.target.value))}
              className="slider-vertical"
            />
          </div>
          <label className="text-xs font-medium text-gray-700 mt-2">highs</label>
        </div>
      </div>
    </div>
  )
}
