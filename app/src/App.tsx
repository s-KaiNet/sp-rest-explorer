import { useCallback, useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { Header } from '@/components/layout'
import { CommandPalette } from '@/components/search'
import type { SearchSelection } from '@/components/search'
import { ContentSkeleton, ErrorState } from '@/components/loading'
import { bootMetadata } from '@/lib/metadata'
import { useRecentlyVisited } from '@/hooks'
import { useAppStore } from '@/stores/app-store'

function App() {
  const status = useAppStore((s) => s.status)
  const navigate = useNavigate()
  const { addVisit } = useRecentlyVisited()
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    void bootMetadata()
  }, [])

  // Global Cmd+K / Ctrl+K shortcut — toggle palette (only when metadata ready)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const appStatus = useAppStore.getState().status
        if (appStatus !== 'ready') return
        setPaletteOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Open palette callback for Header + child routes
  const onSearchClick = useCallback(() => {
    if (useAppStore.getState().status === 'ready') {
      setPaletteOpen(true)
    }
  }, [])

  // Handle search result selection — navigate + track recently visited
  const handleSelect = useCallback(
    (selection: SearchSelection) => {
      navigate(selection.path)

      // Map search kind to recently-visited kind
      const kindMap: Record<SearchSelection['kind'], 'function' | 'navProperty' | 'root'> = {
        entity: 'root',
        function: 'function',
        navProperty: 'navProperty',
      }
      addVisit({
        name: selection.name,
        path: selection.path,
        kind: kindMap[selection.kind],
      })

      setPaletteOpen(false)
    },
    [navigate, addVisit],
  )

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <Header onSearchClick={onSearchClick} />
      <main className="flex min-h-0 flex-1 flex-col pt-14">
        {status === 'ready' ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <Outlet context={{ onSearchClick }} />
          </div>
        ) : status === 'error' ? (
          <ErrorState />
        ) : (
          <ContentSkeleton />
        )}
      </main>
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onSelect={handleSelect}
      />
    </div>
  )
}

export default App
