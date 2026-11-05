import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Clock, MapPin, Phone, Search } from 'iconoir-react'
import { Footer } from '../components/Footer'
import { Navbar } from '../components/Navbar'
import { getAgencies, getErrorMessage, getImageUrl } from '../lib/vehicles'
import type { Agency } from '../types'

export const AgenciesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [result, setResult] = useState<{ retry: number; agencies?: Agency[]; error?: string } | null>(null)
  const [retry, setRetry] = useState(0)
  const query = searchParams.get('q') ?? ''
  const sort = searchParams.get('sort') === 'vehicles' ? 'vehicles' : 'name'

  useEffect(() => {
    const controller = new AbortController()
    getAgencies(controller.signal)
      .then((agencies) => setResult({ retry, agencies }))
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setResult({ retry, error: getErrorMessage(reason) })
      })
    return () => controller.abort()
  }, [retry])

  const current = result?.retry === retry ? result : null
  const agencies = current?.agencies
  const filtered = useMemo(() => {
    if (!agencies) return []
    const normalized = query.trim().toLocaleLowerCase('fr')
    return agencies
      .filter((agency) => !normalized || [agency.name, agency.short_name, agency.address, agency.description].join(' ').toLocaleLowerCase('fr').includes(normalized))
      .sort((a, b) => sort === 'vehicles'
        ? b.vehicles_count - a.vehicles_count || a.name.localeCompare(b.name, 'fr')
        : a.name.localeCompare(b.name, 'fr'))
  }, [agencies, query, sort])

  const updateQuery = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface text-ink">
      <Navbar />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-page flex-1 px-4 pb-20 pt-nav md:px-6">
        <header className="py-10 sm:py-14">
          <p className="text-sm font-medium text-brand-ink">Nos agences</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-semibold text-neutral-900 sm:text-5xl">Votre point de départ à Monastir.</h1>
              <p className="mt-3 max-w-2xl leading-relaxed text-neutral-600">Consultez les adresses et coordonnées des agences, puis découvrez les véhicules qui y sont proposés.</p>
            </div>
            {agencies && <p className="text-sm text-neutral-500" aria-live="polite">{filtered.length} agence{filtered.length === 1 ? '' : 's'}</p>}
          </div>
        </header>

        <section aria-label="Rechercher et trier les agences" className="mb-8 grid grid-cols-1 gap-3 rounded-3xl border border-neutral-200/70 bg-white p-4 sm:grid-cols-[1fr_auto] sm:p-5">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
            Rechercher une agence
            <span className="relative">
              <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <input value={query} onChange={(event) => updateQuery('q', event.target.value)} placeholder="Nom, adresse…" className="min-h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink" />
            </span>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
            Trier par
            <select value={sort} onChange={(event) => updateQuery('sort', event.target.value === 'name' ? '' : event.target.value)} className="min-h-11 rounded-xl border border-neutral-200 bg-neutral-50 px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">
              <option value="name">Nom (A–Z)</option>
              <option value="vehicles">Nombre de véhicules</option>
            </select>
          </label>
        </section>

        <section aria-label="Liste des agences" aria-busy={!current}>
          {!current && <p role="status" className="py-10 text-neutral-600">Chargement des agences…</p>}
          {current?.error && <div role="alert" className="rounded-2xl border border-red-200 bg-white p-6 text-red-900"><h2 className="font-semibold">Les agences sont indisponibles.</h2><p className="mt-2 text-sm">{current.error}</p><button className="mt-4 underline" onClick={() => setRetry((value) => value + 1)}>Réessayer</button></div>}
          {agencies && filtered.length === 0 && <div role="status" className="rounded-2xl bg-white p-6 text-neutral-600"><h2 className="font-semibold text-neutral-900">Aucune agence ne correspond à votre recherche.</h2><button className="mt-3 text-brand-ink underline" onClick={() => updateQuery('q', '')}>Effacer la recherche</button></div>}
          {filtered.length > 0 && <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filtered.map((agency) => (
              <article key={agency.slug} className="overflow-hidden rounded-3xl border border-neutral-200/70 bg-white">
                <Link to={`/agences/${agency.slug}`} className="block aspect-[16/8] overflow-hidden bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink" aria-label={`Découvrir ${agency.name}`}>
                  {agency.image ? <img src={getImageUrl(agency.image)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]" /> : <div className="flex h-full items-center justify-center text-neutral-500"><MapPin aria-hidden="true" /> <span className="ml-2">Monastir</span></div>}
                </Link>
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="font-display text-xl font-semibold text-neutral-900"><Link to={`/agences/${agency.slug}`} className="rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">{agency.name}</Link></h2>
                      {agency.address && <p className="mt-2 flex items-start gap-2 text-sm text-neutral-600"><MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-ink" />{agency.address}</p>}
                    </div>
                    <span className="shrink-0 rounded-xl bg-surface px-3 py-2 text-center text-sm font-semibold text-neutral-900">{agency.vehicles_count}<span className="block text-xs font-normal text-neutral-500">{agency.vehicles_count === 1 ? 'véhicule' : 'véhicules'}</span></span>
                  </div>
                  {agency.description && <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-neutral-600">{agency.description}</p>}
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-600">
                    {agency.phone && <a className="inline-flex items-center gap-2 hover:text-brand-ink" href={`tel:${agency.phone.replace(/[^\d+]/g, '')}`}><Phone aria-hidden="true" className="size-4" />{agency.phone}</a>}
                    {agency.opening_hours && <p className="inline-flex items-center gap-2"><Clock aria-hidden="true" className="size-4" />{agency.opening_hours}</p>}
                  </div>
                  <Link to={`/agences/${agency.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">Détails de l’agence <ArrowRight aria-hidden="true" className="size-4" /></Link>
                </div>
              </article>
            ))}
          </div>}
        </section>
      </main>
      <Footer />
    </div>
  )
}
