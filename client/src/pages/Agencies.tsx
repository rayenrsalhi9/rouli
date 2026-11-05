import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteShell from '@/components/SiteShell'
import { getAgencies, getErrorMessage, type Agency } from '@/lib/vehicles'

function Agencies() {
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading')
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    getAgencies(controller.signal)
      .then((items) => {
        setAgencies(items)
        setStatus(items.length > 0 ? 'ready' : 'empty')
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(getErrorMessage(reason))
          setStatus('error')
        }
      })

    return () => controller.abort()
  }, [retry])

  return (
    <SiteShell>
      <div className="page-container catalog-page">
        <section className="catalog-intro" aria-labelledby="agencies-title">
          <div>
            <h1 id="agencies-title">Nos agences</h1>
            <p>Découvrez les agences et les véhicules disponibles près de vous.</p>
          </div>
        </section>
        <section className="catalog-results" aria-label="Agences" aria-busy={status === 'loading'}>
          {status === 'loading' && <p className="catalog-message" role="status">Chargement des agences…</p>}
          {status === 'error' && (
            <div className="catalog-message" role="alert">
              <h2>Les agences sont indisponibles.</h2>
              <p>{error}</p>
              <button
                type="button"
                className="action-link"
                onClick={() => {
                  setStatus('loading')
                  setRetry((value) => value + 1)
                }}
              >
                Réessayer
              </button>
            </div>
          )}
          {status === 'empty' && (
            <p className="catalog-message">Aucune agence n’est disponible pour le moment.</p>
          )}
          {status === 'ready' && (
            <div className="agency-grid">
              {agencies.map((agency) => (
                <article className="agency-card" key={agency.slug}>
                  {agency.image && <img src={agency.image} alt="" loading="lazy" />}
                  <div>
                    <p className="agency-card__short-name">{agency.short_name}</p>
                    <h2><Link to={`/agences/${agency.slug}`}>{agency.name}</Link></h2>
                    <p>{agency.address}</p>
                    <p className="agency-card__count">
                      {agency.vehicles_count} {agency.vehicles_count === 1 ? 'véhicule' : 'véhicules'}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </SiteShell>
  )
}

export default Agencies
