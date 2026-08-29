import { useI18n } from '../i18n/context.js'

function Footer() {
  const { t } = useI18n()
  return (
    <footer className="site-footer">
      <p>&copy; {new Date().getFullYear()} Warattah</p>
      <p>{t.hero.kicker}</p>
    </footer>
  )
}

export default Footer
