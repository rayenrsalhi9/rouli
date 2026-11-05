import { Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDailyPrice, type Vehicle } from '@/lib/vehicles'
import VehicleImage from '@/components/VehicleImage'

interface VehicleCardProps {
  vehicle: Vehicle
}

function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <article className="vehicle-card">
      <Link
        className="vehicle-card__image-link"
        to={`/vehicules/${vehicle.slug}`}
        aria-label={`Voir le ${vehicle.name}`}
      >
        <VehicleImage vehicle={vehicle} />
      </Link>
      <div className="vehicle-card__body">
        <div className="vehicle-card__meta">
          <span className="vehicle-card__category">{vehicle.category.label}</span>
          {vehicle.tag && <span className="vehicle-card__tag">{vehicle.tag}</span>}
        </div>
        <Link className="vehicle-card__title" to={`/vehicules/${vehicle.slug}`}>
          <h2>{vehicle.name}</h2>
        </Link>
        <div className="vehicle-card__price-row">
          <span className="vehicle-card__price">{formatDailyPrice(vehicle.price_per_day_dt)}</span>
          <span>par jour</span>
          {vehicle.rating > 0 && (
            <span className="vehicle-rating" aria-label={`Note ${vehicle.rating} sur 5`}>
              <Star aria-hidden="true" />
              {vehicle.rating.toFixed(2)}
            </span>
          )}
        </div>
        <div className="vehicle-card__facts">
          <span>{vehicle.range_km} km d’autonomie</span>
          <span aria-hidden="true">/</span>
          <span>{vehicle.agency.short_name}</span>
        </div>
      </div>
    </article>
  )
}

export default VehicleCard
