import { Route, Routes } from 'react-router-dom'
import Home from '@/pages/Home'
import VehicleDetail from '@/pages/VehicleDetail'
import Vehicles from '@/pages/Vehicles'

function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2">
      <h1 className="text-2xl font-semibold">Page not found</h1>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/vehicules" element={<Vehicles />} />
      <Route path="/vehicules/:id" element={<VehicleDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
