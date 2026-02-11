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
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <Header />
      <main className="flex min-h-0 flex-1 flex-col pt-14">
        {status === 'ready' ? (
          <div className="flex min-h-0 flex-1 flex-col">
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
