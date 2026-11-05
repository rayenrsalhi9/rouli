import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { MapPin, Search } from 'iconoir-react'
import { getAgencies, getErrorMessage } from '../lib/vehicles'
import type { Agency } from '../types'

export const HeroSearch = () => {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion() ?? false
  const [agencies, setAgencies] = useState<Agency[] | null>(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [agency, setAgency] = useState('')
  const [vehicleType, setVehicleType] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    getAgencies(controller.signal)
      .then((items) => {
        setAgencies(items)
        setError('')
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(getErrorMessage(reason))
      })
    return () => controller.abort()
  }, [retry])

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (vehicleType) params.set('type', vehicleType)
    if (agency) params.set('agency', agency)
    navigate(`/vehicules${params.size ? `?${params}` : ''}`)
  }

  return (
    <section
      id="section-hero-search"
      className="w-full bg-surface px-4 pb-20 pt-24 text-center sm:px-6 sm:pb-28 sm:pt-32"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mx-auto flex max-w-page flex-col items-center"
      >
        <p className="mb-4 text-xs font-semibold text-brand-ink">Mobilité électrique à Monastir</p>
        <h1 className="max-w-4xl text-balance font-display text-4xl font-semibold leading-tight text-neutral-900 sm:text-5xl md:text-display">
          Monastir à votre rythme, sans bouchons ni galère de parking.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
          Découvrez les vélos et trottinettes électriques des agences de Monastir.
          Comparez les modèles et leurs caractéristiques avant de choisir.
        </p>

        <form
          onSubmit={handleSearch}
          className="mt-9 grid w-full max-w-search grid-cols-1 items-end gap-3 rounded-3xl border border-black/5 bg-white p-4 text-left shadow-sm sm:grid-cols-2 sm:p-5 lg:grid-cols-3"
        >
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
            Type de véhicule
            <select
              value={vehicleType}
              onChange={(event) => setVehicleType(event.target.value)}
              className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
            >
              <option value="">Tous les véhicules</option>
              <option value="bike">Vélos électriques</option>
              <option value="scooter">Trottinettes électriques</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
            <span className="inline-flex items-center gap-1.5"><MapPin aria-hidden="true" /> Agence</span>
            <select
              value={agency}
              onChange={(event) => setAgency(event.target.value)}
              disabled={!agencies}
              className="min-h-12 rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink disabled:opacity-60"
            >
              <option value="">Toutes les agences</option>
              {agencies?.map((item) => (
                <option key={item.slug} value={item.slug}>{item.short_name}</option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-brand-on transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
          >
            <Search aria-hidden="true" className="size-4" />
            Explorer la flotte
          </button>
        </form>

        <div className="mt-10 aspect-[16/10] w-full max-w-page overflow-hidden bg-surface-subtle sm:mt-12">
          <img
            src="/hero-bg.webp"
            alt=""
            width={1536}
            height={1024}
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-800">
            Les agences n’ont pas pu être chargées. {error}{' '}
            <button type="button" className="underline" onClick={() => setRetry((value) => value + 1)}>
              Réessayer
            </button>
          </p>
        )}
      </motion.div>
    </section>
  )
}
