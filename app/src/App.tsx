import { Outlet } from 'react-router'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex flex-1 flex-col pt-14">
        <Outlet />
      </main>
    </div>
  )
}

export default App
