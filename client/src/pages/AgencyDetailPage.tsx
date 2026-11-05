import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Clock, MapPin, Phone } from 'iconoir-react'
import { Footer } from '../components/Footer'
import { Navbar } from '../components/Navbar'
import { VehicleCard } from '../components/VehicleCard'
import { ApiError, getAgency, getErrorMessage, getImageUrl, getVehicles } from '../lib/vehicles'
import type { Agency, VehiclePage } from '../types'

export const AgencyDetailPage = () => {
  const { agencyId = '' } = useParams()
  const [retry, setRetry] = useState(0)
  const [agencyResult, setAgencyResult] = useState<{ slug: string; agency?: Agency; error?: string; status?: number } | null>(null)
  const [vehiclesResult, setVehiclesResult] = useState<{ slug: string; data?: VehiclePage; error?: string } | null>(null)

  useEffect(() => {
    if (!agencyId) return
    const controller = new AbortController()
    getAgency(agencyId, controller.signal)
      .then((agency) => setAgencyResult({ slug: agencyId, agency }))
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setAgencyResult({
          slug: agencyId,
          error: getErrorMessage(reason),
          status: reason instanceof ApiError ? reason.status : undefined,
        })
      })
    return () => controller.abort()
  }, [agencyId, retry])

  useEffect(() => {
    if (!agencyId) return
    const controller = new AbortController()
    getVehicles(new URLSearchParams({ agency: agencyId }), controller.signal)
      .then((data) => setVehiclesResult({ slug: agencyId, data }))
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setVehiclesResult({ slug: agencyId, error: getErrorMessage(reason) })
      })
    return () => controller.abort()
  }, [agencyId, retry])

  const currentAgency = agencyResult?.slug === agencyId ? agencyResult : null
  const agency = currentAgency?.agency
  const currentVehicles = vehiclesResult?.slug === agencyId ? vehiclesResult : null

  return (
    <div className="flex min-h-screen flex-col bg-surface text-ink">
      <Navbar />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-page flex-1 px-4 pb-20 pt-nav md:px-6">
        {!agency ? (
          <section className="flex min-h-[55vh] flex-col items-center justify-center text-center" role={currentAgency?.error ? 'alert' : 'status'}>
            {currentAgency?.error ? (
              <>
                <h1 className="font-display text-3xl font-semibold text-neutral-900">{currentAgency.status === 404 ? 'Agence introuvable' : 'L’agence n’a pas pu être chargée'}</h1>
                <p className="mt-3 max-w-lg text-neutral-600">{currentAgency.error}</p>
                {currentAgency.status !== 404 && <button className="mt-5 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-on focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink" onClick={() => setRetry((value) => value + 1)}>Réessayer</button>}
                <Link to="/agences" className="mt-5 text-sm text-brand-ink underline">Voir les agences</Link>
              </>
            ) : <h1 className="text-lg text-neutral-600">Chargement de l’agence…</h1>}
          </section>
        ) : (
          <>
            <nav aria-label="Fil d’Ariane" className="flex flex-wrap items-center gap-2 py-6 text-sm text-neutral-500">
              <Link to="/" className="rounded hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">Accueil</Link><span aria-hidden="true">/</span>
              <Link to="/agences" className="rounded hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">Agences</Link><span aria-hidden="true">/</span>
              <span aria-current="page" className="text-neutral-900">{agency.short_name}</span>
            </nav>
            <section className="grid min-w-0 overflow-hidden rounded-3xl border border-neutral-200/70 bg-white lg:grid-cols-2" aria-labelledby="agency-title">
              <div className="relative min-h-64 bg-surface-subtle sm:min-h-96">
                {agency.image ? <img src={getImageUrl(agency.image)} alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" /> : <div className="flex h-full min-h-64 items-center justify-center text-neutral-500"><MapPin aria-hidden="true" className="size-6" /></div>}
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-11">
                <p className="text-sm font-medium text-brand-ink">Agence Rouli</p>
                <h1 id="agency-title" className="mt-2 break-words font-display text-3xl font-semibold text-neutral-900 sm:text-4xl">{agency.name}</h1>
                {agency.description && <p className="mt-4 leading-relaxed text-neutral-600">{agency.description}</p>}
                <dl className="mt-6 space-y-4">
                  {agency.address && <div className="flex gap-3 text-sm text-neutral-700"><dt><MapPin aria-label="Adresse" className="size-5 text-brand-ink" /></dt><dd>{agency.address}</dd></div>}
                  {agency.phone && <div className="flex gap-3 text-sm text-neutral-700"><dt><Phone aria-label="Téléphone" className="size-5 text-brand-ink" /></dt><dd><a href={`tel:${agency.phone.replace(/[^\d+]/g, '')}`} className="hover:text-brand-ink">{agency.phone}</a></dd></div>}
                  {agency.opening_hours && <div className="flex gap-3 text-sm text-neutral-700"><dt><Clock aria-label="Horaires" className="size-5 text-brand-ink" /></dt><dd>{agency.opening_hours}</dd></div>}
                </dl>
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <Link to={`/vehicules?agency=${encodeURIComponent(agency.slug)}`} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-brand-on hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">Voir les véhicules <ArrowRight aria-hidden="true" className="size-4" /></Link>
                  {agency.address && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${agency.address}, Monastir`)}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-neutral-700 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">Itinéraire</a>}
                </div>
              </div>
            </section>
            <section className="mt-14" aria-labelledby="agency-vehicles-title" aria-busy={!currentVehicles}>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div><p className="text-sm font-medium text-brand-ink">Catalogue de l’agence</p><h2 id="agency-vehicles-title" className="mt-2 font-display text-2xl font-semibold text-neutral-900 sm:text-3xl">Véhicules proposés</h2></div>
                <span className="text-sm text-neutral-500">{agency.vehicles_count} {agency.vehicles_count === 1 ? 'véhicule' : 'véhicules'}</span>
              </div>
              {!currentVehicles && <p role="status" className="py-8 text-neutral-600">Chargement des véhicules…</p>}
              {currentVehicles?.error && <p role="alert" className="rounded-2xl border border-red-200 bg-white p-5 text-sm text-red-900">Les véhicules de cette agence n’ont pas pu être chargés : {currentVehicles.error}</p>}
              {currentVehicles?.data && currentVehicles.data.results.length === 0 && <p role="status" className="rounded-2xl bg-white p-5 text-neutral-600">Aucun véhicule n’est actuellement proposé par cette agence.</p>}
              {currentVehicles?.data && currentVehicles.data.results.length > 0 && <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{currentVehicles.data.results.map((vehicle) => <VehicleCard key={vehicle.slug} vehicle={vehicle} />)}</div>}
              {currentVehicles?.data && currentVehicles.data.count > currentVehicles.data.results.length && <Link to={`/vehicules?agency=${encodeURIComponent(agency.slug)}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-ink">Voir tous les véhicules de l’agence <ArrowRight aria-hidden="true" className="size-4" /></Link>}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
