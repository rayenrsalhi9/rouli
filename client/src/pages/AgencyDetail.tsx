import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import SiteShell from '@/components/SiteShell'
import VehicleCard from '@/components/VehicleCard'
import { ApiError, getAgency, getErrorMessage, getVehicles, type Agency, type VehiclePage } from '@/lib/vehicles'

function AgencyDetail() {
  const { slug } = useParams()
  const [agencyState, setAgencyState] = useState<{
    slug: string
    retry: number
    agency?: Agency
    error?: string
    status?: number
  } | null>(null)
  const [vehiclesState, setVehiclesState] = useState<{
    slug: string
    retry: number
    vehicles?: VehiclePage
    error?: string
  } | null>(null)
  const [retryAgency, setRetryAgency] = useState(0)
  const [retryVehicles, setRetryVehicles] = useState(0)

  useEffect(() => {
    if (!slug) return
    const controller = new AbortController()

    getAgency(slug, controller.signal)
      .then((agency) => setAgencyState({ slug, retry: retryAgency, agency }))
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setAgencyState({
            slug,
            retry: retryAgency,
            error: getErrorMessage(reason),
            status: reason instanceof ApiError ? reason.status : undefined,
          })
        }
      })

    return () => controller.abort()
  }, [retryAgency, slug])

  useEffect(() => {
    if (!slug) return
    const controller = new AbortController()
    const params = new URLSearchParams({ agency: slug })

    getVehicles(params, controller.signal)
      .then((vehicles) => setVehiclesState({ slug, retry: retryVehicles, vehicles }))
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setVehiclesState({ slug, retry: retryVehicles, error: getErrorMessage(reason) })
        }
      })

    return () => controller.abort()
  }, [retryVehicles, slug])

  const agencyResult =
    agencyState && agencyState.slug === slug && agencyState.retry === retryAgency ? agencyState : null
  const agency = agencyResult?.agency
  const vehiclesResult =
    vehiclesState && vehiclesState.slug === slug && vehiclesState.retry === retryVehicles
      ? vehiclesState
      : null

  if (!agency) {
    return (
      <SiteShell>
        <div className="page-container detail-page">
          <section className="detail-state" role={agencyResult?.error ? 'alert' : 'status'}>
            {agencyResult?.error ? (
              <>
                <h1>{agencyResult.status === 404 ? 'Cette agence est introuvable.' : 'Impossible de charger cette agence.'}</h1>
                <p>{agencyResult.error}</p>
                <div className="detail-actions">
                  <button type="button" className="action-link" onClick={() => setRetryAgency((value) => value + 1)}>
                    Réessayer
                  </button>
                  <Link className="action-link" to="/agences">Voir les agences</Link>
                </div>
              </>
            ) : (
              <h1>Chargement de l’agence…</h1>
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
          <Link to="/agences">Agences</Link>
          <ChevronRight aria-hidden="true" />
          <span aria-current="page">{agency.name}</span>
        </nav>
        <section className="agency-detail">
          {agency.image && <img className="agency-detail__image" src={agency.image} alt="" />}
          <div className="agency-detail__copy">
            <p className="agency-card__short-name">{agency.short_name}</p>
            <h1>{agency.name}</h1>
            {agency.description && <p className="agency-detail__description">{agency.description}</p>}
            <dl className="agency-info">
              {agency.address && <div><dt>Adresse</dt><dd>{agency.address}</dd></div>}
              {agency.phone && <div><dt>Téléphone</dt><dd><a href={`tel:${agency.phone}`}>{agency.phone}</a></dd></div>}
              {agency.opening_hours && <div><dt>Horaires</dt><dd>{agency.opening_hours}</dd></div>}
            </dl>
          </div>
        </section>
        <section className="agency-vehicles" aria-labelledby="agency-vehicles-title" aria-busy={!vehiclesResult}>
          <div className="agency-vehicles__heading">
            <h2 id="agency-vehicles-title">Véhicules disponibles</h2>
            <span>{agency.vehicles_count} au total</span>
          </div>
          {!vehiclesResult && <p role="status">Chargement des véhicules…</p>}
          {vehiclesResult?.error && (
            <div role="alert">
              <p>Les véhicules de cette agence n’ont pas pu être chargés : {vehiclesResult.error}</p>
              <button type="button" className="action-link" onClick={() => setRetryVehicles((value) => value + 1)}>
                Réessayer
              </button>
            </div>
          )}
          {vehiclesResult?.vehicles?.results.length === 0 && (
            <p>Aucun véhicule n’est actuellement proposé par cette agence.</p>
          )}
          {vehiclesResult?.vehicles && vehiclesResult.vehicles.results.length > 0 && (
            <div className="catalog-grid">
              {vehiclesResult.vehicles.results.map((vehicle) => (
                <VehicleCard key={vehicle.slug} vehicle={vehicle} />
              ))}
            </div>
          )}
        </section>
      </div>
    </SiteShell>
  )
}

export default AgencyDetail
