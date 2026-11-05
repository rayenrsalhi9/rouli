import { useParams } from 'react-router-dom'

function VehicleDetail() {
  const { id } = useParams()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-semibold">Véhicule {id}</h1>
    </div>
  )
}

export default VehicleDetail
