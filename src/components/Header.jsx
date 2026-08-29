import { NavLink } from 'react-router-dom'
import warattahMark from '../assets/brand/warattah-mark.svg'
import warattahWordmark from '../assets/brand/warattah-wordmark.svg'
import { useI18n } from '../i18n/context.js'

function Header() {
  const { t } = useI18n()
  const navItems = [
    { to: '/', label: t.nav.home, end: true },
    { to: '/contact', label: t.nav.contact },
  ]

  return (
    <header className="site-header">
      <NavLink to="/" className="brand" end>
        <img src={warattahMark} alt="" className="brand-mark" />
        <img src={warattahWordmark} alt="Warattah" className="brand-name-logo" />
      </NavLink>
      <nav>
        <ul className="site-nav">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

export default Header
