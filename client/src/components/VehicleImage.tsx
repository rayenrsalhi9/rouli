import { useState } from 'react'
import { vehicleTypeLabel, type Vehicle } from '@/lib/vehicles'

interface VehicleImageProps {
  vehicle: Pick<Vehicle, 'image' | 'name' | 'vehicle_type'>
  className?: string
  loading?: 'eager' | 'lazy'
}

function VehicleImage({ vehicle, className = '', loading = 'lazy' }: VehicleImageProps) {
  const [failedSources, setFailedSources] = useState<string[]>([])
  const folder = vehicle.vehicle_type === 'bike' ? 'bikes' : 'scooters'
  const candidates = vehicle.image.startsWith('/vehicles/')
    ? [
        `/${folder}/${vehicle.image.split('/').pop()}`,
        `/${folder}/${vehicle.image.split('/').pop()?.replace('-plus-', '+-')}`,
      ]
    : [vehicle.image]
  const source = candidates.find((candidate) => candidate && !failedSources.includes(candidate))

  return (
    <figure
      className={`vehicle-image ${className}`.trim()}
      data-slot="vehicle-image"
      data-alt={`${vehicle.name}, ${vehicleTypeLabel(vehicle.vehicle_type)}`}
    >
      {source ? (
        <img
          src={source}
          alt={`${vehicle.name}, ${vehicleTypeLabel(vehicle.vehicle_type)}`}
          loading={loading}
          onError={() => setFailedSources((current) => [...current, source])}
        />
      ) : (
        <div className="vehicle-image__fallback">
          <span>{vehicleTypeLabel(vehicle.vehicle_type)}</span>
          <strong>{vehicle.name}</strong>
        </div>
      )}
    </figure>
  )
}

export default VehicleImage
