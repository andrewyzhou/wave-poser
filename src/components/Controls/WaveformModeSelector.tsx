import { useStore } from '@/state/useStore'

export function WaveformModeSelector() {
  const { waveformMode, set } = useStore()

  const modes = [
    { id: 'camera', label: 'Camera', description: 'Pose detection from camera' },
    { id: 'sine', label: 'Sine', description: 'Sine wave' },
    { id: 'saw', label: 'Saw', description: 'Sawtooth wave' },
    { id: 'square', label: 'Square', description: 'Square wave' }
  ] as const

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Waveform Mode</h3>
      <div className="grid grid-cols-2 gap-3">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => set({ waveformMode: mode.id })}
            className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              waveformMode === mode.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium text-sm">{mode.label}</div>
            <div className="text-xs text-gray-500 mt-1">{mode.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
