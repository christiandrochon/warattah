import { NavLink } from 'react-router-dom'
import SunMark from './SunMark.jsx'

const navItems = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/contact', label: 'Contact' },
]

function Header() {
  return (
    <header className="site-header">
      <NavLink to="/" className="brand" end>
        <span className="brand-mark">
          <SunMark />
        </span>
        <span className="brand-name">Warattah</span>
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
