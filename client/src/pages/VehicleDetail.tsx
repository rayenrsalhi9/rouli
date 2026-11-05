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
  getRelatedVehicles,
  getVehicle,
  vehicleTypeLabel,
  type Vehicle,
  type VehicleDetail,
} from '@/lib/vehicles'

function VehicleDetail() {
  const { slug } = useParams()
  const [result, setResult] = useState<{
    slug: string
    retry: number
    vehicle?: VehicleDetail
    error?: string
    status?: number
  } | null>(null)
  const [retry, setRetry] = useState(0)
  const [relatedState, setRelatedState] = useState<{
    slug: string
    retry: number
    vehicles?: Vehicle[]
    error?: string
  } | null>(null)
  const [retryRelated, setRetryRelated] = useState(0)

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
    getRelatedVehicles(vehicle.slug, controller.signal)
      .then((vehicles) => {
        setRelatedState({
          slug: vehicle.slug,
          retry: retryRelated,
          vehicles,
        })
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setRelatedState({ slug: vehicle.slug, retry: retryRelated, error: getErrorMessage(reason) })
        }
      })

    return () => controller.abort()
  }, [retryRelated, vehicle])

  const related =
    vehicle && relatedState?.slug === vehicle.slug && relatedState.retry === retryRelated
      ? relatedState
      : null
  const specs = vehicle
    ? [
        { label: 'Batterie', value: vehicle.battery_capacity },
        { label: 'Poids', value: vehicle.weight_kg === null ? '' : `${vehicle.weight_kg} kg` },
        { label: 'Moteur', value: vehicle.motor },
        { label: 'Freins', value: vehicle.brakes },
        { label: 'Temps de charge', value: vehicle.charge_time_h === null ? '' : `${vehicle.charge_time_h} h` },
        { label: 'Autonomie', value: `${vehicle.range_km} km` },
        { label: 'Vitesse max.', value: `${vehicle.max_speed_kmh} km/h` },
      ].filter((spec) => spec.value.trim() !== '')
    : []

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
              {specs.map((spec) => (
                <div className="detail-spec" key={spec.label}>
                  <strong>{spec.value}</strong>
                  <span>{spec.label}</span>
                </div>
              ))}
            </section>
            <section className="detail-agency">
              <h2>Disponible chez {vehicle.agency.short_name}</h2>
              <p><Link to={`/agences/${vehicle.agency.slug}`}>{vehicle.agency.name}</Link></p>
            </section>
            <div className="detail-actions">
              <Link className="action-link" to="/vehicules">Parcourir la flotte</Link>
            </div>
          </article>
        </div>
        {vehicle.features.length > 0 && (
          <section className="detail-list-section" aria-labelledby="features-title">
            <h2 id="features-title">Équipements et fonctionnalités</h2>
            <ul>{vehicle.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
          </section>
        )}
        {vehicle.included_accessories.length > 0 && (
          <section className="detail-list-section" aria-labelledby="accessories-title">
            <h2 id="accessories-title">Accessoires inclus</h2>
            <ul>{vehicle.included_accessories.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        )}
        <section className="related-section" aria-labelledby="related-title">
          <h2 id="related-title">Véhicules similaires</h2>
          {!related && <p role="status">Chargement des véhicules similaires…</p>}
          {related?.error && (
            <div role="alert">
              <p>Les véhicules similaires n’ont pas pu être chargés : {related.error}</p>
              <button type="button" className="action-link" onClick={() => setRetryRelated((value) => value + 1)}>
                Réessayer
              </button>
            </div>
          )}
          {related?.vehicles?.length === 0 && (
            <p>Aucun véhicule similaire n’est disponible pour le moment.</p>
          )}
          {related?.vehicles && related.vehicles.length > 0 && (
            <div className="catalog-grid">
              {related.vehicles.map((item) => (
                <VehicleCard key={item.slug} vehicle={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </SiteShell>
  )
}

export default VehicleDetail
