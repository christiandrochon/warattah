import { useI18n } from '../i18n/context.js'

function VideoEmbed({ videoId, title, isPlaying, onPlay }) {
  const { t } = useI18n()
  return (
    <div className="video-card">
      <div className="video-frame">
        {isPlaying ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="video-thumb"
            onClick={onPlay}
            aria-label={t.video.play(title)}
            style={{
              backgroundImage: `url(https://img.youtube.com/vi/${videoId}/hqdefault.jpg)`,
            }}
          >
            <span className="video-play">▶</span>
          </button>
        )}
      </div>
      <h3 className="video-title">{title}</h3>
    </div>
  )
}

export default VideoEmbed
