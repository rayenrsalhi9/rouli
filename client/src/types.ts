export interface Category {
  slug: string
  label: string
}

export interface AgencySummary {
  slug: string
  name: string
  short_name: string
}

export interface Agency extends AgencySummary {
  id: string
  address: string
  phone: string
  opening_hours: string
  description: string
  image: string
  vehicles_count: number
}

export interface Vehicle {
  id: string
  slug: string
  name: string
  vehicle_type: 'bike' | 'scooter'
  category: Category
  agency: AgencySummary
  price_per_day_dt: number
  total_units: number
  range_km: number
  max_speed_kmh: number
  tag: string
  image: string
  description: string
  rating: number
  reviews_count: number
}

export interface VehicleDetail extends Vehicle {
  battery_capacity: string | null
  weight_kg: number | null
  motor: string | null
  brakes: string | null
  charge_time_h: number | null
  features: string[]
  included_accessories: string[]
}

export interface VehiclePage {
  count: number
  next: string | null
  previous: string | null
  results: Vehicle[]
}
