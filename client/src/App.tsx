import { Link, Route, Routes } from 'react-router-dom'
import SiteShell from '@/components/SiteShell'
import Home from '@/pages/Home'
import VehicleDetail from '@/pages/VehicleDetail'
import Vehicles from '@/pages/Vehicles'

function NotFound() {
  return (
    <SiteShell>
      <div className="detail-state">
        <h1>Cette page n’existe pas.</h1>
        <p>Le véhicule recherché est peut-être ailleurs.</p>
        <Link className="action-link" to="/vehicules">Voir les véhicules</Link>
      </div>
    </SiteShell>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/vehicules" element={<Vehicles />} />
      <Route path="/vehicules/:slug" element={<VehicleDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
