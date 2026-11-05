import { useEffect, useState } from 'react'
import { ChevronRight, Star } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import SiteShell from '@/components/SiteShell'
import VehicleCard from '@/components/VehicleCard'
import VehicleImage from '@/components/VehicleImage'
import {
  ApiError,
  formatDailyPrice,
  getErrorMessage,
  getVehicle,
  getVehicles,
  vehicleTypeLabel,
  type Vehicle,
} from '@/lib/vehicles'

function VehicleDetail() {
  const { slug } = useParams()
  const [result, setResult] = useState<{
    slug: string
    retry: number
    vehicle?: Vehicle
    error?: string
    status?: number
  } | null>(null)
  const [retry, setRetry] = useState(0)
  const [relatedState, setRelatedState] = useState<{
    slug: string
    vehicles?: Vehicle[]
    error?: string
  } | null>(null)

  useEffect(() => {
    if (!slug) return
    const controller = new AbortController()

    getVehicle(slug, controller.signal)
      .then((vehicle) => setResult({ slug, retry, vehicle }))
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setResult({
            slug,
            retry,
            error: getErrorMessage(reason),
            status: reason instanceof ApiError ? reason.status : undefined,
          })
        }
      })

    return () => controller.abort()
  }, [retry, slug])

  const currentResult =
    result && result.slug === slug && result.retry === retry ? result : null
  const vehicle = currentResult?.vehicle ?? null
  const error = currentResult?.error ?? ''
  const isNotFound = currentResult?.status === 404

  useEffect(() => {
    if (!vehicle) return
    const controller = new AbortController()
    const params = new URLSearchParams({ category: vehicle.category.slug })

    getVehicles(params, controller.signal)
      .then((page) => {
        setRelatedState({
          slug: vehicle.slug,
          vehicles: page.results.filter((item) => item.slug !== vehicle.slug).slice(0, 3),
        })
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setRelatedState({ slug: vehicle.slug, error: getErrorMessage(reason) })
        }
      })

    return () => controller.abort()
  }, [vehicle])

  const related = vehicle && relatedState?.slug === vehicle.slug ? relatedState : null

  if (!vehicle) {
    return (
      <SiteShell>
        <div className="page-container detail-page">
          <section className="detail-state" role={error ? 'alert' : 'status'}>
            {error ? (
              <>
                <h1>{isNotFound ? 'Ce véhicule est introuvable.' : 'Impossible de charger ce véhicule.'}</h1>
                <p>{error}</p>
                <div className="detail-actions">
                  <button type="button" className="action-link" onClick={() => setRetry((value) => value + 1)}>
                    Réessayer
                  </button>
                  <Link className="action-link" to="/vehicules">Voir les véhicules</Link>
                </div>
              </>
            ) : (
              <h1>Chargement du véhicule…</h1>
            )}
          </section>
        </div>
      </SiteShell>
    )
  }

  return (
    <SiteShell>
      <div className="page-container detail-page">
        <nav className="detail-breadcrumbs" aria-label="Fil d’Ariane">
          <Link to="/">Accueil</Link>
          <ChevronRight aria-hidden="true" />
          <Link to="/vehicules">Véhicules</Link>
          <ChevronRight aria-hidden="true" />
          <span aria-current="page">{vehicle.name}</span>
        </nav>
        <div className="detail-grid">
          <VehicleImage
            vehicle={vehicle}
            className="detail-image"
            loading="eager"
          />
          <article className="detail-copy">
            <p className="detail-copy__category">
              {vehicle.category.label} / {vehicleTypeLabel(vehicle.vehicle_type)}
            </p>
            <h1>{vehicle.name}</h1>
            {vehicle.tag && <span className="detail-copy__tag">{vehicle.tag}</span>}
            <div className="detail-price">
              <strong>{formatDailyPrice(vehicle.price_per_day_dt)}</strong>
              <span>par jour</span>
            </div>
            {vehicle.rating > 0 && (
              <p className="vehicle-rating" aria-label={`${vehicle.rating} sur 5, ${vehicle.reviews_count} avis`}>
                <Star aria-hidden="true" />
                {vehicle.rating.toFixed(2)}
                <span>({vehicle.reviews_count} avis)</span>
              </p>
            )}
            {vehicle.description && (
              <p className="detail-copy__description">{vehicle.description}</p>
            )}
            <section className="detail-specs" aria-label="Caractéristiques">
              <div className="detail-spec">
                <strong>{vehicle.range_km} km</strong>
                <span>Autonomie</span>
              </div>
              <div className="detail-spec">
                <strong>{vehicle.max_speed_kmh} km/h</strong>
                <span>Vitesse max.</span>
              </div>
              <div className="detail-spec">
                <strong>{vehicle.total_units}</strong>
                <span>En flotte</span>
              </div>
            </section>
            <section className="detail-agency">
              <h2>Disponible chez {vehicle.agency.short_name}</h2>
              <p>{vehicle.agency.name}</p>
            </section>
            <div className="detail-actions">
              <Link className="action-link" to="/vehicules">Parcourir la flotte</Link>
            </div>
          </article>
        </div>
        {(!related || related.error || (related.vehicles && related.vehicles.length > 0)) && (
          <section className="related-section" aria-labelledby="related-title">
            <h2 id="related-title">À découvrir aussi</h2>
            {!related && <p role="status">Recherche de véhicules proches…</p>}
            {related?.error && (
              <p role="alert">Les véhicules similaires n’ont pas pu être chargés : {related.error}</p>
            )}
            {related?.vehicles && related.vehicles.length > 0 && (
              <div className="catalog-grid">
                {related.vehicles.map((item) => (
                  <VehicleCard key={item.slug} vehicle={item} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </SiteShell>
  )
}

export default VehicleDetail
