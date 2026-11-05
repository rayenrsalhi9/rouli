export interface VehicleCategory {
  slug: string
  label: string
}

export interface VehicleAgency {
  slug: string
  name: string
  short_name: string
}

export interface Vehicle {
  id: string
  slug: string
  name: string
  vehicle_type: 'bike' | 'scooter'
  category: VehicleCategory
  agency: VehicleAgency
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

export interface VehiclePage {
  count: number
  next: string | null
  previous: string | null
  results: Vehicle[]
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

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

export function getVehicle(slug: string, signal?: AbortSignal): Promise<Vehicle> {
  return request<Vehicle>(`/vehicles/${encodeURIComponent(slug)}/`, signal)
}

export function getVehicleCategories(signal?: AbortSignal): Promise<VehicleCategory[]> {
  return request<VehicleCategory[]>('/categories/', signal)
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
