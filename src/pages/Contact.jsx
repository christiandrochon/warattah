import { useI18n } from '../i18n/context.js'

const links = [
  { label: 'Email', value: 'warattah@mailo.com', href: 'mailto:warattah@mailo.com' },
  { label: 'Facebook', value: 'facebook.com/warattah', href: 'https://www.facebook.com/warattah' },
  {
    label: 'Bandcamp',
    value: 'warattah.bandcamp.com',
    href: 'https://warattah.bandcamp.com/music',
  },
  { label: 'SoundCloud', value: 'soundcloud.com/warattah', href: 'https://soundcloud.com/warattah' },
  {
    label: 'ReverbNation',
    value: 'reverbnation.com/warattah',
    href: 'https://www.reverbnation.com/warattah',
  },
]

function Contact() {
  const { t } = useI18n()
  return (
    <section className="section">
      <div className="section-inner">
        <span className="section-eyebrow">{t.contact.eyebrow}</span>
        <h1>{t.contact.title}</h1>
        <ul className="track-list">
          {links.map((link) => (
            <li key={link.label}>
              <a
                className="track-row"
                href={link.href}
                target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                rel={link.href.startsWith('mailto:') ? undefined : 'noreferrer'}
              >
                <span className="track-title">{link.label}</span>
                <span className="track-status">{link.value}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Contact
