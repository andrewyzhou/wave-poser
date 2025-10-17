import { useStore } from '@/state/useStore'
import { getNearestNote, getFrequencyFromNote } from '@/lib/mapping'

export function PitchControl() {
  const { freqHz, set } = useStore()
  
  // Create note-based slider (C2 to C7, 5 octaves)
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const octaves = [2, 3, 4, 5, 6, 7] // C2 to C7
  const totalNotes = notes.length * octaves.length
  
  // Convert frequency to note index
  const { note, octave } = getNearestNote(freqHz)
  const noteIndex = notes.indexOf(note)
  const octaveIndex = octaves.indexOf(octave)
  const currentNoteIndex = octaveIndex * notes.length + noteIndex
  
  const handleNoteChange = (value: number) => {
    const octaveIndex = Math.floor(value / notes.length)
    const noteIndex = value % notes.length
    const newOctave = octaves[octaveIndex]
    const newNote = notes[noteIndex]
    const newFreq = getFrequencyFromNote(newNote, newOctave)
    set({ freqHz: newFreq })
  }
  
  const { note: currentNote, octave: currentOctave, cents } = getNearestNote(freqHz)
  const centsDisplay = cents > 0 ? `+${cents}` : cents.toString()
  
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm">
      <h3 className="text-lg font-mono font-semibold mb-3">Pitch</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note: {currentNote}{currentOctave}
          </label>
          <input
            type="range"
            min="0"
            max={totalNotes - 1}
            step="1"
            value={currentNoteIndex}
            onChange={(e) => handleNoteChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
        
      </div>
    </div>
  )
}
