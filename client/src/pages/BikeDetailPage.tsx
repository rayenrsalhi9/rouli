import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BatteryFull, Clock, MapPin, StarSolid, Weight } from 'iconoir-react'
import { Footer } from '../components/Footer'
import { Navbar } from '../components/Navbar'
import { VehicleCard } from '../components/VehicleCard'
import { ApiError, formatDailyPrice, getErrorMessage, getImageUrl, getRelatedVehicles, getVehicle, vehicleTypeLabel } from '../lib/vehicles'
import type { Vehicle, VehicleDetail } from '../types'

export function BikeDetailPage() {
  const { bikeId = '' } = useParams()
  const [retry, setRetry] = useState(0)
  const [result, setResult] = useState<{ slug: string; vehicle?: VehicleDetail; error?: string; status?: number } | null>(null)
  const [related, setRelated] = useState<{ slug: string; vehicles?: Vehicle[]; error?: string } | null>(null)

  useEffect(() => {
    if (!bikeId) return
    const controller = new AbortController()
    getVehicle(bikeId, controller.signal)
      .then((vehicle) => setResult({ slug: bikeId, vehicle }))
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setResult({
          slug: bikeId,
          error: getErrorMessage(reason),
          status: reason instanceof ApiError ? reason.status : undefined,
        })
      })
    return () => controller.abort()
  }, [bikeId, retry])

  const current = result?.slug === bikeId ? result : null
  const vehicle = current?.vehicle

  useEffect(() => {
    if (!vehicle) return
    const controller = new AbortController()
    getRelatedVehicles(vehicle.slug, controller.signal)
      .then((items) => setRelated({ slug: vehicle.slug, vehicles: items }))
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setRelated({ slug: vehicle.slug, error: getErrorMessage(reason) })
      })
    return () => controller.abort()
  }, [vehicle])

  const relatedResult = related?.slug === vehicle?.slug ? related : null

  return (
    <div className="flex min-h-screen flex-col bg-surface text-ink">
      <Navbar />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-catalog flex-1 px-4 pb-20 pt-nav sm:px-6">
        {!vehicle ? (
          <section className="flex min-h-[55vh] flex-col items-center justify-center text-center" role={current?.error ? 'alert' : 'status'}>
            {current?.error ? (
              <>
                <h1 className="font-display text-3xl font-semibold text-neutral-900">{current.status === 404 ? 'Véhicule introuvable' : 'Le véhicule n’a pas pu être chargé'}</h1>
                <p className="mt-3 max-w-lg text-neutral-600">{current.error}</p>
                {current.status !== 404 && <button className="mt-5 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-on focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink" onClick={() => setRetry((value) => value + 1)}>Réessayer</button>}
                <Link to="/vehicules" className="mt-5 text-sm text-brand-ink underline">Retour au catalogue</Link>
              </>
            ) : <h1 className="text-lg text-neutral-600">Chargement du véhicule…</h1>}
          </section>
        ) : (
          <>
            <nav aria-label="Fil d’Ariane" className="flex flex-wrap items-center gap-2 py-6 text-sm text-neutral-500">
              <Link to="/" className="rounded hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">Accueil</Link>
              <span aria-hidden="true">/</span>
              <Link to={`/vehicules?type=${vehicle.vehicle_type}`} className="rounded hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">{vehicleTypeLabel(vehicle.vehicle_type)}</Link>
              <span aria-hidden="true">/</span><span aria-current="page" className="text-neutral-900">{vehicle.name}</span>
            </nav>
            <article className="overflow-hidden rounded-3xl border border-neutral-200/70 bg-white">
              <div className="grid min-w-0 grid-cols-1 lg:grid-cols-2">
                <div className="relative min-h-72 bg-surface-subtle lg:min-h-[480px]">
                  {vehicle.image ? <img src={getImageUrl(vehicle.image)} alt={vehicle.name} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" /> : <div className="flex h-full min-h-72 items-center justify-center text-neutral-500">Image non disponible</div>}
                  {vehicle.tag && <span className="absolute left-5 top-5 rounded-full bg-white/95 px-3 py-1.5 text-sm font-medium">{vehicle.tag}</span>}
                </div>
                <div className="flex flex-col p-6 sm:p-9 lg:p-11">
                  <p className="text-sm font-medium text-brand-ink">{vehicle.category.label} · {vehicleTypeLabel(vehicle.vehicle_type)}</p>
                  <h1 className="mt-3 break-words font-display text-3xl font-semibold leading-tight text-neutral-900 sm:text-4xl">{vehicle.name}</h1>
                  {vehicle.rating > 0 && <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-neutral-600"><StarSolid aria-hidden="true" className="size-4 text-brand-ink" /> {vehicle.rating}{vehicle.reviews_count > 0 && <span>({vehicle.reviews_count} avis)</span>}</p>}
                  <p className="mt-5 font-display text-2xl font-semibold text-neutral-900">{formatDailyPrice(vehicle.price_per_day_dt)} <span className="font-sans text-sm font-normal text-neutral-500">par jour</span></p>
                  {vehicle.description && <p className="mt-5 leading-relaxed text-neutral-600">{vehicle.description}</p>}
                  <ul className="mt-6 flex flex-wrap gap-2 text-sm text-neutral-700">
                    <li className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-2"><BatteryFull aria-hidden="true" className="size-4 text-brand-ink" /> {vehicle.range_km} km</li>
                    <li className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-2"><Clock aria-hidden="true" className="size-4 text-brand-ink" /> {vehicle.max_speed_kmh} km/h max.</li>
                    {vehicle.weight_kg !== null && <li className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-2"><Weight aria-hidden="true" className="size-4 text-brand-ink" /> {vehicle.weight_kg} kg</li>}
                  </ul>
                  <div className="mt-8 border-t border-neutral-100 pt-5">
                    <p className="text-sm text-neutral-500">Agence associée</p>
                    <Link to={`/agences/${vehicle.agency.slug}`} className="mt-1 inline-flex items-center gap-2 rounded font-semibold text-neutral-900 hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">
                      <MapPin aria-hidden="true" className="size-4 text-brand-ink" /> {vehicle.agency.name} <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="grid gap-8 border-t border-neutral-100 p-6 sm:p-9 lg:grid-cols-2 lg:p-11">
                <section aria-labelledby="vehicle-specs">
                  <h2 id="vehicle-specs" className="font-display text-xl font-semibold text-neutral-900">Caractéristiques</h2>
                  <dl className="mt-4 divide-y divide-neutral-100">
                    {[
                      ['Batterie', vehicle.battery_capacity],
                      ['Poids', vehicle.weight_kg === null ? '' : `${vehicle.weight_kg} kg`],
                      ['Moteur', vehicle.motor],
                      ['Freins', vehicle.brakes],
                      ['Temps de charge', vehicle.charge_time_h === null ? '' : `${vehicle.charge_time_h} h`],
                      ['Autonomie', `${vehicle.range_km} km`],
                      ['Vitesse maximale', `${vehicle.max_speed_kmh} km/h`],
                    ].filter(([, value]) => value).map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4 py-3 text-sm">
                        <dt className="text-neutral-500">{label}</dt><dd className="text-right font-medium text-neutral-900">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
                <div className="space-y-8">
                  {vehicle.features.length > 0 && <section aria-labelledby="vehicle-features"><h2 id="vehicle-features" className="font-display text-xl font-semibold text-neutral-900">Équipements et fonctionnalités</h2><ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-relaxed text-neutral-600">{vehicle.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></section>}
                  {vehicle.included_accessories.length > 0 && <section aria-labelledby="vehicle-accessories"><h2 id="vehicle-accessories" className="font-display text-xl font-semibold text-neutral-900">Accessoires inclus</h2><ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-relaxed text-neutral-600">{vehicle.included_accessories.map((item) => <li key={item}>{item}</li>)}</ul></section>}
                </div>
              </div>
            </article>
            {relatedResult?.error && <p role="alert" className="mt-8 text-sm text-red-800">Les véhicules similaires n’ont pas pu être chargés : {relatedResult.error}</p>}
            {relatedResult?.vehicles && relatedResult.vehicles.length > 0 && <section className="mt-14" aria-labelledby="related-title"><div className="mb-6 flex items-end justify-between gap-4"><h2 id="related-title" className="font-display text-2xl font-semibold text-neutral-900">Autres véhicules à découvrir</h2><Link to="/vehicules" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-ink">Catalogue <ArrowRight aria-hidden="true" className="size-4" /></Link></div><div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{relatedResult.vehicles.map((item) => <VehicleCard key={item.slug} vehicle={item} />)}</div></section>}
          </>
        )}
        <Link to="/vehicules" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-brand-ink"><ArrowLeft aria-hidden="true" className="size-4" /> Retour au catalogue</Link>
      </main>
      <Footer />
    </div>
  )
}
