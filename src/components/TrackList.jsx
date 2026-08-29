import { useRef, useState } from 'react'
import { useI18n } from '../i18n/context.js'

const audioBase = `${import.meta.env.BASE_URL}audio/`

const tracks = [
  { title: 'Breath', duration: '3:45', file: 'breath.mp3' },
  { title: 'The Urge', duration: '4:31', file: 'the-urge.mp3' },
]

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function TrackList() {
  const { t } = useI18n()
  const [playingIndex, setPlayingIndex] = useState(null)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRefs = useRef([])

  const handleToggle = (index) => {
    const current = audioRefs.current[index]
    if (!current) return

    if (playingIndex === index) {
      current.pause()
      setPlayingIndex(null)
      return
    }

    const previous = audioRefs.current[playingIndex]
    if (previous) previous.pause()

    current.currentTime = current.currentTime || 0
    current.play()
    setPlayingIndex(index)
  }

  return (
    <ul className="track-list">
      {tracks.map((track, index) => {
        const isPlaying = playingIndex === index
        return (
          <li key={track.title} className="track-row">
            <span className="track-main">
              <button
                type="button"
                className="track-play"
                onClick={() => handleToggle(index)}
                aria-label={isPlaying ? t.track.pause(track.title) : t.track.play(track.title)}
              >
                {isPlaying ? '❚❚' : '▶'}
              </button>
              <span className="track-title">{track.title}</span>
            </span>
            <span className="track-status">
              {isPlaying ? `${formatTime(currentTime)} / ${track.duration}` : track.duration}
            </span>
            <audio
              ref={(el) => {
                audioRefs.current[index] = el
              }}
              src={`${audioBase}${track.file}`}
              preload="none"
              onTimeUpdate={(e) => {
                if (isPlaying) setCurrentTime(e.target.currentTime)
              }}
              onEnded={() => {
                setPlayingIndex(null)
                setCurrentTime(0)
              }}
            />
          </li>
        )
      })}
    </ul>
  )
}

export default TrackList
