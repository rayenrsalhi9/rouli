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
  id: number
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
  battery_capacity: string
  weight_kg: number | null
  motor: string
  brakes: string
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

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '')

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, statusText: string) {
    super(`L’API a répondu ${status} ${statusText}`.trim())
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { signal })
  if (!response.ok) {
    throw new ApiError(response.status, response.statusText)
  }
  return response.json() as Promise<T>
}

export function getVehicles(
  params: URLSearchParams = new URLSearchParams(),
  signal?: AbortSignal,
): Promise<VehiclePage> {
  const query = params.toString()
  return request<VehiclePage>(`/vehicles/${query ? `?${query}` : ''}`, signal)
}

export function getVehicle(slug: string, signal?: AbortSignal): Promise<VehicleDetail> {
  return request<VehicleDetail>(`/vehicles/${encodeURIComponent(slug)}/`, signal)
}

export function getRelatedVehicles(slug: string, signal?: AbortSignal): Promise<Vehicle[]> {
  return request<Vehicle[]>(`/vehicles/${encodeURIComponent(slug)}/related/`, signal)
}

export function getAgencies(signal?: AbortSignal): Promise<Agency[]> {
  return request<Agency[]>('/agencies/', signal)
}

export function getAgency(slug: string, signal?: AbortSignal): Promise<Agency> {
  return request<Agency>(`/agencies/${encodeURIComponent(slug)}/`, signal)
}

export function getCategories(signal?: AbortSignal): Promise<Category[]> {
  return request<Category[]>('/categories/', signal)
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Une erreur inattendue est survenue.'
}

export function formatDailyPrice(amount: number): string {
  const formatted = new Intl.NumberFormat('fr-TN', {
    maximumFractionDigits: 2,
  }).format(amount)
  return `${formatted} DT`
}

export function vehicleTypeLabel(type: Vehicle['vehicle_type']): string {
  return type === 'bike' ? 'Vélo électrique' : 'Trottinette électrique'
}
