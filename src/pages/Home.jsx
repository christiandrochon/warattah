import TrackList from '../components/TrackList.jsx'
import demoCoverV1 from '../assets/album/distorsion.jpg'
import demoCoverV2 from '../assets/album/distorsion-v2.jpg'
import albumCover from '../assets/album/hatred-and-strength.jpg'

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <span className="hero-kicker">Metal tribal</span>
          <h1 className="hero-title">Warattah</h1>
          <p className="hero-tagline">
            Musique brute, racines profondes. Découvrez l'univers de
            Warattah.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => scrollToSection('musique')}
            >
              Écouter
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => scrollToSection('groupe')}
            >
              Le groupe
            </button>
          </div>
        </div>
      </section>

      <section id="musique" className="section">
        <div className="section-inner">
          <span className="section-eyebrow">Musique</span>
          <h2>Titres</h2>
          <TrackList />
        </div>
      </section>

      <section id="groupe" className="section">
        <div className="section-inner bio-content">
          <span className="section-eyebrow">Bio</span>
          <h2>Le groupe</h2>

          <p>
            WARATTAH est un groupe de Métal formé par Khris dans le but de
            pouvoir écrire la musique qu’il n’avait pu exprimer avec ses
            autres formations.
          </p>

          <p>
            En avril 2006, la démo 4 titres — « Distorsion » — a été
            enregistrée. Celle-ci a été élue « Démo du mois » dans « Rock
            Hard », « Disque autoproduit du mois » dans « Guitar Part » et
            diffusée sur leurs cds samplers respectifs. Elle a également été
            chroniquée dans les magazines spécialisés « Rock Hard », « Rock
            One », « Metallian », « Guitarist Magazine », « Rock Tribune »,
            ainsi que dans de nombreux webzines et fanzines à travers le
            monde. Face à la demande, elle a connu un second pressage, avec
            une nouvelle pochette.
          </p>

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
              <span className="section-eyebrow">Démo</span>
              <h3>Distorsion</h3>
              <p>4 titres — autoproduit — avril 2006 — 2 pressages</p>
            </div>
          </div>

          <p>
            Le morceau « Skulls in the River Beds » a servi de support
            musical pour le reportage des « Vibrations Urbaines 2006 » de
            Pessac (contest BMX, Rollers). Le clip vidéo du morceau « Fits
            of Rage » a été diffusé sur MCM, MCM Belgique, MTV Pulse, au
            Benelux sur S-Television, et au Canada par Shok Productions.
          </p>

          <p>
            C’est en 2007 que le groupe se stabilise autour de Khris
            (guitare/chant), Denis (guitare), Simon (batterie) et Matthieu
            (basse). WARATTAH est un groupe de Métal sans concession, avec
            un chant brut, une batterie technique, des guitares puissantes
            et une basse groovy. Faire de la scène est indispensable au
            groupe.
          </p>

          <p>
            Le groupe a enregistré son premier album — « Hatred & Strength »
            (14 titres) — en août 2009, mais suite à un grave accident de la
            route de Khris, le digipack n’est sorti qu’en janvier 2012 sur
            le label XIIIbis Records / Warner Music.
          </p>

          <div className="album-card">
            <div className="album-covers">
              <img
                className="album-cover"
                src={albumCover}
                alt="Pochette de l'album Hatred & Strength"
              />
            </div>
            <div className="album-info">
              <span className="section-eyebrow">Album</span>
              <h3>Hatred &amp; Strength</h3>
              <p>14 titres — XIIIbis Records / Warner Music — janvier 2012</p>
            </div>
          </div>

          <p>
            À sa sortie, l’album a été très bien chroniqué dans « Rock
            Hard », « Metallian », « Metal Obs » et beaucoup d’autres
            magazines et webzines. Il a abouti sur de nombreuses dates,
            notamment aux côtés de groupes comme Dagoba ou Gojira, ce qui a
            permis au groupe de toucher une large audience et de récolter de
            très bons retours de ces concerts. Le second clip officiel, du
            morceau « Walk The Line », a été diffusé sur plusieurs chaînes
            de TV spécialisées et a fait l’objet de plusieurs milliers de
            vues sur internet.
          </p>

          <p>
            En 2013, le groupe se met en stand-by car Khris doit interrompre
            ses activités musicales pour raisons personnelles. Mais fin
            2017, il reprend le groupe là où il l’avait laissé et s’attelle
            désormais à la composition du second album.
          </p>
        </div>
      </section>
    </>
  )
}

export default Home
