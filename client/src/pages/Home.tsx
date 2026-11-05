import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-semibold">Rouli</h1>
      <Button render={<Link to="/vehicules" />}>Get started</Button>
    </div>
  )
}

export default Home
