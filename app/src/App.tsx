import { useEffect } from 'react'
import { Outlet } from 'react-router'
import { Header } from '@/components/layout'
import { ContentSkeleton, ErrorState } from '@/components/loading'
import { bootMetadata } from '@/lib/metadata'
import { useAppStore } from '@/stores/app-store'

function App() {
  const status = useAppStore((s) => s.status)

  useEffect(() => {
    void bootMetadata()
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex flex-1 flex-col pt-14">
        {status === 'ready' ? (
          <div className="flex flex-1 flex-col animate-in fade-in duration-200">
            <Outlet />
          </div>
        ) : status === 'error' ? (
          <ErrorState />
        ) : (
          <ContentSkeleton />
        )}
      </main>
    </div>
  )
}

export default App
