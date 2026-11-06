import type { Agency, Category, Vehicle, VehicleDetail, VehiclePage } from '../types'

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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (!response.ok) throw new ApiError(response.status, response.statusText)

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error(
      `Réponse API inattendue (${contentType || 'type de contenu inconnu'}). Vérifiez la configuration de l’API.`,
    )
  }

  try {
    return await response.json() as T
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('La réponse de l’API contient un JSON invalide.')
    }
    throw error
  }
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

export function getImageUrl(path: string): string {
  if (!path || /^https?:\/\//i.test(path) || /^\/(bikes|scooters|agencies)\//.test(path)) return path
  const apiUrl = import.meta.env.VITE_API_URL
  if (apiUrl && /^https?:\/\//i.test(apiUrl)) return new URL(path, apiUrl).href
  return path
}

export function formatDailyPrice(amount: number): string {
  const value = new Intl.NumberFormat('fr-TN', { maximumFractionDigits: 2 }).format(amount)
  return `${value} DT`
}

export function vehicleTypeLabel(type: Vehicle['vehicle_type']): string {
  return type === 'bike' ? 'Vélo électrique' : 'Trottinette électrique'
}
