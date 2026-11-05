import { useEffect, useState } from 'react'
import { ArrowRight, MapPin } from 'iconoir-react'
import { Link, useLocation } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { HeroSearch } from '../components/HeroSearch'
import { Navbar } from '../components/Navbar'
import { VehicleCard } from '../components/VehicleCard'
import { getAgencies, getErrorMessage, getVehicles, getImageUrl } from '../lib/vehicles'
import type { Agency, VehiclePage } from '../types'

export const HomePage = () => {
  const location = useLocation()
  const [vehicles, setVehicles] = useState<VehiclePage | null>(null)
  const [agencies, setAgencies] = useState<Agency[] | null>(null)
  const [vehiclesError, setVehiclesError] = useState('')
  const [agenciesError, setAgenciesError] = useState('')
  const [retryVehicles, setRetryVehicles] = useState(0)
  const [retryAgencies, setRetryAgencies] = useState(0)

  useEffect(() => {
    if (!location.hash) return
    const frame = requestAnimationFrame(() => {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    })
    return () => cancelAnimationFrame(frame)
  }, [location.hash])

  useEffect(() => {
    const controller = new AbortController()
    getVehicles(new URLSearchParams({ ordering: '-rating' }), controller.signal)
      .then((data) => {
        setVehicles(data)
        setVehiclesError('')
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setVehiclesError(getErrorMessage(reason))
      })
    return () => controller.abort()
  }, [retryVehicles])

  useEffect(() => {
    const controller = new AbortController()
    getAgencies(controller.signal)
      .then((data) => {
        setAgencies(data)
        setAgenciesError('')
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setAgenciesError(getErrorMessage(reason))
      })
    return () => controller.abort()
  }, [retryAgencies])

  return (
    <div className="flex min-h-screen flex-col bg-surface text-ink">
      <Navbar />
      <main id="main" tabIndex={-1} className="flex w-full flex-1 flex-col items-center pt-nav">
        <HeroSearch />

        <section className="w-full bg-white py-16 sm:py-20" aria-labelledby="featured-title">
          <div className="mx-auto max-w-page px-4 md:px-6">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-ink">Catalogue</p>
                <h2 id="featured-title" className="mt-2 font-display text-3xl font-semibold text-neutral-900 sm:text-4xl">
                  La flotte Rouli
                </h2>
                <p className="mt-2 max-w-xl text-neutral-600">Parcourez les modèles et consultez leurs tarifs et caractéristiques.</p>
              </div>
              <Link to="/vehicules" className="inline-flex items-center gap-2 rounded text-sm font-semibold text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">
                Tout le catalogue <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
            {vehiclesError ? (
              <div role="alert" className="rounded-2xl border border-red-200 bg-white p-5 text-sm text-red-900">
                <p>Les véhicules n’ont pas pu être chargés. {vehiclesError}</p>
                <button className="mt-2 font-semibold underline" onClick={() => setRetryVehicles((value) => value + 1)}>Réessayer</button>
              </div>
            ) : vehicles ? (
              vehicles.results.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {vehicles.results.slice(0, 3).map((vehicle) => <VehicleCard key={vehicle.slug} vehicle={vehicle} />)}
                </div>
              ) : <p role="status" className="rounded-2xl bg-surface p-5 text-neutral-600">Aucun véhicule n’est actuellement proposé.</p>
            ) : <p role="status" className="py-8 text-neutral-600">Chargement des véhicules…</p>}
          </div>
        </section>

        <section className="w-full bg-surface py-16 sm:py-20" aria-labelledby="agencies-title">
          <div className="mx-auto max-w-page px-4 md:px-6">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-ink">Nos agences</p>
                <h2 id="agencies-title" className="mt-2 font-display text-3xl font-semibold text-neutral-900 sm:text-4xl">
                  Trouvez votre point de départ
                </h2>
              </div>
              <Link to="/agences" className="inline-flex items-center gap-2 rounded text-sm font-semibold text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">
                Toutes les agences <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
            {agenciesError ? (
              <div role="alert" className="rounded-2xl border border-red-200 bg-white p-5 text-sm text-red-900">
                <p>Les agences n’ont pas pu être chargées. {agenciesError}</p>
                <button className="mt-2 font-semibold underline" onClick={() => setRetryAgencies((value) => value + 1)}>Réessayer</button>
              </div>
            ) : agencies ? (
              agencies.length ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {agencies.slice(0, 3).map((agency) => (
                    <Link key={agency.slug} to={`/agences/${agency.slug}`} className="group overflow-hidden rounded-3xl border border-neutral-200/70 bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">
                      {agency.image ? (
                        <img src={getImageUrl(agency.image)} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" />
                      ) : (
                        <div className="flex aspect-[16/10] items-center justify-center bg-surface-subtle text-neutral-500"><MapPin aria-hidden="true" /></div>
                      )}
                      <div className="p-5">
                        <h3 className="font-display text-xl font-semibold text-neutral-900 group-hover:text-brand-ink">{agency.name}</h3>
                        <p className="mt-2 text-sm text-neutral-600">{agency.address}</p>
                        <p className="mt-4 text-sm text-neutral-500">{agency.vehicles_count} {agency.vehicles_count === 1 ? 'véhicule' : 'véhicules'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : <p role="status" className="rounded-2xl bg-white p-5 text-neutral-600">Aucune agence n’est actuellement proposée.</p>
            ) : <p role="status" className="py-8 text-neutral-600">Chargement des agences…</p>}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
