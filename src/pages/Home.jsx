import { useLayoutEffect, useRef, useState } from 'react'
import TrackList from '../components/TrackList.jsx'
import VideoEmbed from '../components/VideoEmbed.jsx'
import demoCoverV1 from '../assets/album/distorsion.jpg'
import demoCoverV2 from '../assets/album/distorsion-v2.jpg'
import albumCover from '../assets/album/hatred-and-strength.jpg'
import warattahWordmark from '../assets/brand/warattah-wordmark.svg'
import FlecheFaitiere from '../components/FlecheFaitiere.jsx'
import { useI18n } from '../i18n/context.js'

// function scrollToSection(id) {
//   document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
// }

function Home() {
  const { t } = useI18n()
  const heroRef = useRef(null)
  const contentRef = useRef(null)
  const titleRef = useRef(null)
  const [activeClip, setActiveClip] = useState(null)

  useLayoutEffect(() => {
    function alignTitleToSplit() {
      const hero = heroRef.current
      const content = contentRef.current
      const title = titleRef.current
      if (!hero || !content || !title) return

      content.style.transform = 'none'
      const heroRect = hero.getBoundingClientRect()
      const titleRect = title.getBoundingClientRect()
      const heroMid = heroRect.top + heroRect.height / 2
      const titleMid = titleRect.top + titleRect.height / 2
      content.style.transform = `translateY(${heroMid - titleMid}px)`
    }

    alignTitleToSplit()
    document.fonts?.ready.then(alignTitleToSplit)
    window.addEventListener('resize', alignTitleToSplit)
    return () => window.removeEventListener('resize', alignTitleToSplit)
  }, [])

  return (
    <>
      <section className="hero" ref={heroRef}>
        <div className="hero-content" ref={contentRef}>
          <span className="hero-kicker">{t.hero.kicker}</span>
          <h1 className="hero-title" ref={titleRef}>
            <img src={warattahWordmark} alt="Warattah" className="hero-title-logo" />
          </h1>
          <p className="hero-tagline">{t.hero.tagline}</p>
        </div>
      </section>

      <section id="musique" className="section">
        <div className="section-inner">
          <h2>{t.sections.titres}</h2>
          <TrackList />
        </div>
      </section>

      <section id="clips" className="section">
        <div className="section-inner">
          <h2>{t.sections.clips}</h2>
          <div className="video-grid">
            <VideoEmbed
              videoId="oQgoRfjrkWw"
              title="Fits of Rage"
              isPlaying={activeClip === 'oQgoRfjrkWw'}
              onPlay={() => setActiveClip('oQgoRfjrkWw')}
            />
            <VideoEmbed
              videoId="4pYQwZ2jiiE"
              title="Walk The Line"
              isPlaying={activeClip === '4pYQwZ2jiiE'}
              onPlay={() => setActiveClip('4pYQwZ2jiiE')}
            />
          </div>
        </div>
      </section>

      <section id="groupe" className="section">
        <div className="section-inner bio-content">
          <h2>{t.sections.groupe}</h2>

          <p>{t.bio.p1}</p>

          <div className="album-card">
            <div className="album-covers">
              <img
                className="album-cover"
                src={demoCoverV1}
                alt="Pochette de la démo Distorsion, 1er pressage"
              />
              <img
                className="album-cover"
                src={demoCoverV2}
                alt="Pochette de la démo Distorsion, 2nd pressage"
              />
            </div>
            <div className="album-info">
              <span className="section-eyebrow">{t.bio.demoEyebrow}</span>
              <h3>{t.bio.demoTitle}</h3>
              <p>{t.bio.demoMeta}</p>
            </div>
          </div>

          <p>{t.bio.p2}</p>

          <div className="album-card">
            <div className="album-covers">
              <img
                className="album-cover"
                src={albumCover}
                alt="Pochette de l'album Hatred & Strength"
              />
            </div>
            <div className="album-info">
              <span className="section-eyebrow">{t.bio.albumEyebrow}</span>
              <h3>{t.bio.albumTitle}</h3>
              <p>{t.bio.albumMeta}</p>
            </div>
          </div>

          <p>{t.bio.p3}</p>
          <p>{t.bio.p4}</p>
          <p>{t.bio.p5}</p>
          <p>{t.bio.p6}</p>
          <p className="tribal-word">
            <FlecheFaitiere className="tribal-icon" />
            {t.bio.tribal}
          </p>
        </div>
      </section>
    </>
  )
}

export default Home
