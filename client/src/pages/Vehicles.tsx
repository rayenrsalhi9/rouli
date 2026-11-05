import { useEffect, useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import SiteShell from '@/components/SiteShell'
import VehicleCard from '@/components/VehicleCard'
import {
  getErrorMessage,
  getVehicleCategories,
  getVehicles,
  type VehicleCategory,
  type VehiclePage,
} from '@/lib/vehicles'

type VehicleTypeFilter = '' | 'bike' | 'scooter'

const SORT_OPTIONS = [
  { value: 'name', label: 'Nom' },
  { value: 'price_per_day_dt', label: 'Prix croissant' },
  { value: '-price_per_day_dt', label: 'Prix décroissant' },
  { value: '-rating', label: 'Mieux notés' },
  { value: '-range_km', label: 'Autonomie' },
]

function Vehicles() {
  const [categories, setCategories] = useState<VehicleCategory[]>([])
  const [categoryError, setCategoryError] = useState('')
  const [catalogState, setCatalogState] = useState<{
    key: string
    data?: VehiclePage
    error?: string
  } | null>(null)
  const [retryCatalog, setRetryCatalog] = useState(0)
  const [retryCategories, setRetryCategories] = useState(0)
  const [type, setType] = useState<VehicleTypeFilter>('')
  const [category, setCategory] = useState('')
  const [maximumPrice, setMaximumPrice] = useState('')
  const [sort, setSort] = useState('name')
  const [draftSearch, setDraftSearch] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const controller = new AbortController()

    getVehicleCategories(controller.signal)
      .then((items) => {
        setCategories(items)
        setCategoryError('')
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setCategoryError(getErrorMessage(reason))
      })

    return () => controller.abort()
  }, [retryCategories])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(draftSearch.trim())
      setPage(1)
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [draftSearch])

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page) })
    if (type) params.set('type', type)
    if (category) params.set('category', category)
    if (maximumPrice) params.set('max_price', maximumPrice)
    if (sort) params.set('ordering', sort)
    if (search) params.set('search', search)
    return params.toString()
  }, [category, maximumPrice, page, search, sort, type])

  const requestKey = `${query}:${retryCatalog}`

  useEffect(() => {
    const controller = new AbortController()

    getVehicles(new URLSearchParams(query), controller.signal)
      .then((data) => setCatalogState({ key: requestKey, data }))
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setCatalogState({ key: requestKey, error: getErrorMessage(reason) })
        }
      })

    return () => controller.abort()
  }, [query, requestKey, retryCatalog])

  const isCurrentRequest = catalogState?.key === requestKey
  const loading = !isCurrentRequest
  const catalog = isCurrentRequest ? catalogState.data ?? null : null
  const catalogError = isCurrentRequest ? catalogState.error ?? '' : ''

  const resetFilters = () => {
    setType('')
    setCategory('')
    setMaximumPrice('')
    setSort('name')
    setDraftSearch('')
    setSearch('')
    setPage(1)
  }

  return (
    <SiteShell>
      <div className="page-container catalog-page">
        <section className="catalog-intro" aria-labelledby="catalog-title">
          <div>
            <h1 id="catalog-title">Les véhicules</h1>
            <p>Vélos et trottinettes pour découvrir Monastir, de la médina à la corniche.</p>
          </div>
          {catalog && (
            <p className="catalog-intro__count" aria-live="polite">
              {catalog.count} {catalog.count === 1 ? 'véhicule' : 'véhicules'} dans la flotte
            </p>
          )}
        </section>

        <section aria-label="Filtres du catalogue">
          <div className="catalog-toolbar">
            <label className="filter-field">
              Rechercher
              <input
                type="search"
                value={draftSearch}
                onChange={(event) => setDraftSearch(event.target.value)}
                placeholder="Nom, agence…"
                autoComplete="off"
              />
            </label>
            <label className="filter-field">
              Catégorie
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value)
                  setPage(1)
                }}
              >
                <option value="">Toutes</option>
                {categories.map((item) => (
                  <option key={item.slug} value={item.slug}>{item.label}</option>
                ))}
              </select>
            </label>
            <label className="filter-field">
              Budget par jour
              <select
                value={maximumPrice}
                onChange={(event) => {
                  setMaximumPrice(event.target.value)
                  setPage(1)
                }}
              >
                <option value="">Tous les prix</option>
                <option value="20">Jusqu’à 20 DT</option>
                <option value="25">Jusqu’à 25 DT</option>
                <option value="30">Jusqu’à 30 DT</option>
                <option value="35">Jusqu’à 35 DT</option>
              </select>
            </label>
            <label className="filter-field">
              Trier par
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value)
                  setPage(1)
                }}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="catalog-controls">
            <div className="filter-group" role="group" aria-label="Type de véhicule">
              <span className="filter-group__label">Type</span>
              <button
                className="filter-button"
                type="button"
                aria-pressed={type === ''}
                onClick={() => {
                  setType('')
                  setPage(1)
                }}
              >
                Tous
              </button>
              <button
                className="filter-button"
                type="button"
                aria-pressed={type === 'bike'}
                onClick={() => {
                  setType(type === 'bike' ? '' : 'bike')
                  setPage(1)
                }}
              >
                Vélos
              </button>
              <button
                className="filter-button"
                type="button"
                aria-pressed={type === 'scooter'}
                onClick={() => {
                  setType(type === 'scooter' ? '' : 'scooter')
                  setPage(1)
                }}
              >
                Trottinettes
              </button>
            </div>
            {(type || category || maximumPrice || search) && (
              <button className="reset-button" type="button" onClick={resetFilters}>
                <RotateCcw aria-hidden="true" size={15} />
                Effacer les filtres
              </button>
            )}
          </div>
        </section>

        {categoryError && (
          <p className="catalog-message" role="alert">
            Les catégories n’ont pas pu être chargées : {categoryError}{' '}
            <button type="button" className="action-link" onClick={() => setRetryCategories((value) => value + 1)}>
              Réessayer
            </button>
          </p>
        )}

        <section className="catalog-results" aria-label="Résultats des véhicules" aria-busy={loading}>
          {loading && <p className="catalog-message" role="status">Chargement des véhicules…</p>}
          {!loading && catalogError && (
            <div className="catalog-message" role="alert">
              <h2>Le catalogue est indisponible.</h2>
              <p>{catalogError}</p>
              <button
                type="button"
                className="action-link"
                onClick={() => setRetryCatalog((value) => value + 1)}
              >
                Réessayer
              </button>
            </div>
          )}
          {!loading && !catalogError && catalog?.results.length === 0 && (
            <div className="catalog-message">
              <h2>Aucun véhicule ne correspond.</h2>
              <p>Essayez un autre terme ou élargissez vos filtres.</p>
              <button type="button" className="action-link" onClick={resetFilters}>
                Voir toute la flotte
              </button>
            </div>
          )}
          {!loading && !catalogError && catalog && catalog.results.length > 0 && (
            <>
              <div className="catalog-grid">
                {catalog.results.map((vehicle) => (
                  <VehicleCard key={vehicle.slug} vehicle={vehicle} />
                ))}
              </div>
              {(catalog.previous || catalog.next) && (
                <nav className="catalog-pagination" aria-label="Pagination du catalogue">
                  <button
                    className="pagination-button"
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    Page précédente
                  </button>
                  <span aria-live="polite">Page {page}</span>
                  <button
                    className="pagination-button"
                    type="button"
                    disabled={!catalog.next}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Page suivante
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </SiteShell>
  )
}

export default Vehicles
