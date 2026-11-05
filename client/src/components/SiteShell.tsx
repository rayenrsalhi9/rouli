import { Link, useLocation } from 'react-router-dom'

interface SiteShellProps {
  children: React.ReactNode
}

function SiteShell({ children }: SiteShellProps) {
  const location = useLocation()
  const isCatalog = location.pathname.startsWith('/vehicules')
  const isAgencies = location.pathname.startsWith('/agences')

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="wordmark" to="/" aria-label="Rouli, accueil">
            rouli<span aria-hidden="true">.</span>
          </Link>
          <nav className="site-nav" aria-label="Navigation principale">
            <Link
              className={isCatalog ? 'site-nav__catalog' : undefined}
              to="/vehicules"
              aria-current={isCatalog ? 'page' : undefined}
            >
              Les véhicules
            </Link>
            <Link
              className={isAgencies ? 'site-nav__catalog' : undefined}
              to="/agences"
              aria-current={isAgencies ? 'page' : undefined}
            >
              Les agences
            </Link>
            <span>Monastir</span>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="site-footer__inner">
          <Link className="wordmark" to="/" aria-label="Rouli, accueil">
            rouli<span aria-hidden="true">.</span>
          </Link>
          <p>Des deux-roues à louer, au rythme de Monastir.</p>
          <Link to="/vehicules">Parcourir la flotte</Link>
          <Link to="/agences">Découvrir les agences</Link>
        </div>
      </footer>
    </div>
  )
}

export default SiteShell
