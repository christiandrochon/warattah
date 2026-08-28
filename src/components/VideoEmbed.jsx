function VideoEmbed({ videoId, title, isPlaying, onPlay }) {
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
            aria-label={`Lire le clip ${title}`}
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
