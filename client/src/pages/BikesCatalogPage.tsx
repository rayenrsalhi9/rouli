import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Refresh, Search } from 'iconoir-react'
import { Footer } from '../components/Footer'
import { Navbar } from '../components/Navbar'
import { VehicleCard } from '../components/VehicleCard'
import { getAgencies, getCategories, getErrorMessage, getVehicles } from '../lib/vehicles'
import type { Agency, Category, VehiclePage } from '../types'

const SORT_OPTIONS = [
  { value: 'name', label: 'Nom' },
  { value: 'price_per_day_dt', label: 'Prix croissant' },
  { value: '-price_per_day_dt', label: 'Prix décroissant' },
  { value: '-rating', label: 'Mieux notés' },
  { value: '-range_km', label: 'Autonomie' },
]

export const BikesCatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [supportError, setSupportError] = useState('')
  const [retryOptions, setRetryOptions] = useState(0)
  const [sort, setSort] = useState('name')
  const [maxPrice, setMaxPrice] = useState('')
  const [draftSearch, setDraftSearch] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<{ key: string; data?: VehiclePage; error?: string } | null>(null)
  const [retryVehicles, setRetryVehicles] = useState(0)

  const type = searchParams.get('type') === 'bike' || searchParams.get('type') === 'scooter'
    ? searchParams.get('type')!
    : ''
  const agency = searchParams.get('agency') ?? ''
  const category = searchParams.get('category') ?? ''

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([getAgencies(controller.signal), getCategories(controller.signal)])
      .then(([agencyItems, categoryItems]) => {
        setAgencies(agencyItems)
        setCategories(categoryItems)
        setSupportError('')
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setSupportError(getErrorMessage(reason))
      })
    return () => controller.abort()
  }, [retryOptions])

  const params = useMemo(() => {
    const query = new URLSearchParams({ page: String(page), ordering: sort })
    if (type) query.set('type', type)
    if (agency) query.set('agency', agency)
    if (category) query.set('category', category)
    if (maxPrice) query.set('max_price', maxPrice)
    if (search) query.set('search', search)
    return query
  }, [agency, category, maxPrice, page, search, sort, type])
  const requestKey = `${params.toString()}:${retryVehicles}`

  useEffect(() => {
    const controller = new AbortController()
    getVehicles(params, controller.signal)
      .then((data) => setResult({ key: requestKey, data }))
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setResult({ key: requestKey, error: getErrorMessage(reason) })
      })
    return () => controller.abort()
  }, [params, requestKey])

  const current = result?.key === requestKey ? result : null
  const vehicles = current?.data
  const error = current?.error

  const updateQuery = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next, { replace: true })
    setPage(1)
  }

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSearch(draftSearch.trim())
    setPage(1)
  }

  const clearFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true })
    setSort('name')
    setMaxPrice('')
    setDraftSearch('')
    setSearch('')
    setPage(1)
  }

  const changePage = (url: string | null, fallback: number) => {
    if (!url) return
    const nextPage = Number(new URL(url, window.location.origin).searchParams.get('page')) || fallback
    setPage(nextPage)
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface text-ink">
      <Navbar />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-catalog flex-1 px-4 pb-20 pt-nav sm:px-6">
        <header className="py-10 sm:py-14">
          <p className="text-sm font-medium text-brand-ink">Catalogue Rouli</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-semibold text-neutral-900 sm:text-5xl">
                {type === 'bike' ? 'Vélos électriques' : type === 'scooter' ? 'Trottinettes électriques' : 'Nos véhicules'}
              </h1>
              <p className="mt-3 max-w-2xl text-neutral-600">Comparez les modèles, les tarifs journaliers et les caractéristiques proposés par les agences.</p>
            </div>
            {vehicles && <p className="text-sm text-neutral-500" aria-live="polite">{vehicles.count} véhicule{vehicles.count === 1 ? '' : 's'}</p>}
          </div>
        </header>

        <form onSubmit={submitSearch} className="mb-8 grid grid-cols-1 gap-3 rounded-3xl border border-neutral-200/70 bg-white p-4 sm:grid-cols-2 lg:grid-cols-6 sm:p-5" aria-label="Filtres du catalogue">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
            Rechercher
            <span className="relative">
              <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Nom, description…" className="min-h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink" />
            </span>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
            Type
            <select value={type} onChange={(event) => updateQuery('type', event.target.value)} className="min-h-11 rounded-xl border border-neutral-200 bg-neutral-50 px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">
              <option value="">Tous les véhicules</option>
              <option value="bike">Vélos</option>
              <option value="scooter">Trottinettes</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
            Agence
            <select value={agency} onChange={(event) => updateQuery('agency', event.target.value)} className="min-h-11 rounded-xl border border-neutral-200 bg-neutral-50 px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">
              <option value="">Toutes</option>
              {agencies.map((item) => <option key={item.slug} value={item.slug}>{item.short_name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
            Catégorie
            <select value={category} onChange={(event) => updateQuery('category', event.target.value)} className="min-h-11 rounded-xl border border-neutral-200 bg-neutral-50 px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">
              <option value="">Toutes</option>
              {categories.map((item) => <option key={item.slug} value={item.slug}>{item.label}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
            Prix maximum / jour
            <input type="number" min="0" step="1" value={maxPrice} onChange={(event) => { setMaxPrice(event.target.value); setPage(1) }} placeholder="Sans limite" className="min-h-11 rounded-xl border border-neutral-200 bg-neutral-50 px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
            Trier par
            <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1) }} className="min-h-11 rounded-xl border border-neutral-200 bg-neutral-50 px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">
              {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-6">
            <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-brand-on hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">
              <Search aria-hidden="true" className="size-4" /> Appliquer la recherche
            </button>
            <button type="button" onClick={clearFilters} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-neutral-200 px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">
              <Refresh aria-hidden="true" className="size-4" /> Réinitialiser
            </button>
          </div>
        </form>

        {supportError && <p role="alert" className="mb-5 text-sm text-red-800">Les filtres n’ont pas pu être chargés : {supportError} <button className="underline" onClick={() => setRetryOptions((value) => value + 1)}>Réessayer</button></p>}
        <section aria-label="Résultats du catalogue" aria-busy={!current}>
          {!current && <p role="status" className="py-10 text-neutral-600">Chargement des véhicules…</p>}
          {error && <div role="alert" className="rounded-2xl border border-red-200 bg-white p-6 text-red-900"><h2 className="font-semibold">Le catalogue est indisponible.</h2><p className="mt-2 text-sm">{error}</p><button className="mt-4 underline" onClick={() => setRetryVehicles((value) => value + 1)}>Réessayer</button></div>}
          {vehicles && vehicles.results.length === 0 && <p role="status" className="rounded-2xl bg-white p-6 text-neutral-600">Aucun véhicule ne correspond à ces critères.</p>}
          {vehicles && vehicles.results.length > 0 && <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{vehicles.results.map((vehicle) => <VehicleCard key={vehicle.slug} vehicle={vehicle} />)}</div>}
          {vehicles && (vehicles.previous || vehicles.next) && (
            <nav aria-label="Pagination du catalogue" className="mt-10 flex items-center justify-between">
              {vehicles.previous ? <button onClick={() => changePage(vehicles.previous, Math.max(1, page - 1))} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"><ArrowLeft aria-hidden="true" className="size-4" /> Précédent</button> : <span />}
              <span className="text-sm text-neutral-500">Page {page}</span>
              {vehicles.next ? <button onClick={() => changePage(vehicles.next, page + 1)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">Suivant <ArrowRight aria-hidden="true" className="size-4" /></button> : <span />}
            </nav>
          )}
        </section>
        <div className="mt-10"><Link to="/" className="text-sm text-brand-ink underline">Retour à l’accueil</Link></div>
      </main>
      <Footer />
    </div>
  )
}
