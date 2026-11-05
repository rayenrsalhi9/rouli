import { Link } from 'react-router-dom'
import { ArrowRight, BatteryFull, MapPin, StarSolid } from 'iconoir-react'
import { formatDailyPrice, getImageUrl, vehicleTypeLabel } from '../lib/vehicles'
import type { Vehicle } from '../types'

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-neutral-200/70 bg-white">
      <Link
        to={`/vehicules/${vehicle.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
        aria-label={`Voir ${vehicle.name}`}
      >
        {vehicle.image ? (
          <img
            src={getImageUrl(vehicle.image)}
            alt={vehicle.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-500">
            Image non disponible
          </div>
        )}
        {vehicle.tag && (
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-neutral-800">
            {vehicle.tag}
          </span>
        )}
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-neutral-500">{vehicle.category.label} · {vehicleTypeLabel(vehicle.vehicle_type)}</p>
            <h2 className="mt-1 break-words font-display text-xl font-semibold text-neutral-900">
              <Link to={`/vehicules/${vehicle.slug}`} className="rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">
                {vehicle.name}
              </Link>
            </h2>
          </div>
          {vehicle.rating > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-neutral-700">
              <StarSolid aria-hidden="true" className="size-4 text-brand-ink" />
              {vehicle.rating}
              {vehicle.reviews_count > 0 && <span className="text-neutral-500">({vehicle.reviews_count})</span>}
            </span>
          )}
        </div>
        {vehicle.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-neutral-600">{vehicle.description}</p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-neutral-100 pt-4 text-sm text-neutral-600">
          <span className="font-semibold text-neutral-900">{formatDailyPrice(vehicle.price_per_day_dt)} / jour</span>
          <span className="inline-flex items-center gap-1"><BatteryFull aria-hidden="true" className="size-4" /> {vehicle.range_km} km</span>
          <span className="inline-flex items-center gap-1"><MapPin aria-hidden="true" className="size-4" /> {vehicle.agency.short_name}</span>
        </div>
        <Link
          to={`/vehicules/${vehicle.slug}`}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
        >
          Voir les détails <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </article>
  )
}
