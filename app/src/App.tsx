import { Outlet } from 'react-router'
import { Header } from '@/components/layout'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex flex-1 flex-col pt-14">
        <Outlet />
      </main>
    </div>
  )
}

export default App
