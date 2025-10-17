import { useStore } from '@/state/useStore'

export function SaturationControl() {
  const { saturation, set } = useStore()
  
  const handleSaturationChange = (value: number) => {
    set({ saturation: value })
  }
  
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm">
      <h3 className="text-lg font-mono font-semibold mb-3">Saturation</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Strength: {(saturation * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={saturation}
            onChange={(e) => handleSaturationChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>
    </div>
  )
}
