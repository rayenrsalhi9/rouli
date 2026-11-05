import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteShell from '@/components/SiteShell'
import VehicleImage from '@/components/VehicleImage'
import { formatDailyPrice, getErrorMessage, getVehicles, type Vehicle } from '@/lib/vehicles'

function Home() {
  const [featured, setFeatured] = useState<Vehicle | null>(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading')

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({ ordering: '-rating' })

    getVehicles(params, controller.signal)
      .then((page) => {
        setFeatured(page.results[0] ?? null)
        setStatus(page.results.length > 0 ? 'ready' : 'empty')
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(getErrorMessage(reason))
          setStatus('error')
        }
      })

    return () => controller.abort()
  }, [])

  return (
    <SiteShell>
      <div className="page-container home-page">
        <section className="home-copy" aria-labelledby="home-title">
          <h1 id="home-title">Monastir, en deux roues.</h1>
          <p>Vélos et trottinettes à louer pour parcourir la ville à votre rythme.</p>
          <Link className="action-link" to="/vehicules">Voir les véhicules</Link>
        </section>
        <section className="home-feature" aria-label="Un véhicule de la flotte">
          {status === 'ready' && featured ? (
            <>
              <Link
                className="vehicle-card__image-link"
                to={`/vehicules/${featured.slug}`}
                aria-label={`Découvrir ${featured.name}`}
              >
                <VehicleImage vehicle={featured} className="home-feature__image" loading="eager" />
              </Link>
              <div className="home-feature__caption">
                <div>
                  <h2>{featured.name}</h2>
                  <p>{featured.category.label} / {featured.agency.short_name}</p>
                </div>
                <span className="home-feature__price">
                  {formatDailyPrice(featured.price_per_day_dt)} / jour
                </span>
              </div>
            </>
          ) : (
            <p className="home-feature__status" role={status === 'error' ? 'alert' : 'status'}>
              {status === 'error'
                ? `Le véhicule vedette n’a pas pu être chargé : ${error}`
                : status === 'empty'
                  ? 'Aucun véhicule n’est actuellement proposé.'
                  : 'Chargement du catalogue…'}
            </p>
          )}
        </section>
      </div>
    </SiteShell>
  )
}

export default Home
