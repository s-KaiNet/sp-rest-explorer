import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { Search, Github, Star } from 'lucide-react'
import { DarkModeToggle } from '@/components/theme'
import { fetchStarCount, formatStarCount } from '@/lib/github'

const navLinks: { to: string; label: string }[] = [
  { to: '/_api', label: 'Explore API' },
  { to: '/entity', label: 'Explore Types' },
  { to: '/api-diff', label: 'API Changelog' },
  { to: '/how-it-works', label: 'How it works' },
]

const activeClass = 'rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground'
const inactiveClass = 'rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors'

interface HeaderProps {
  onSearchClick?: () => void
}

export function Header({ onSearchClick }: HeaderProps) {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const [starCount, setStarCount] = useState<number | null>(null)

  // "Explore API" active only when browsing the API (/_api/*), NOT on home (/)
  const isExploreApiActive = pathname.startsWith('/_api')

  useEffect(() => {
    void fetchStarCount('s-KaiNet/sp-rest-explorer').then((count) => {
      if (count !== null) setStarCount(count)
    })
  }, [])

  return (
    <header className="fixed top-0 z-50 flex h-14 w-full items-center border-b border-border bg-background">
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-4">
        {/* Left: App name + Nav links */}
        <div className="flex items-center gap-1">
          <Link to="/" className="mr-3 text-sm font-semibold text-foreground whitespace-nowrap hover:text-foreground/80 transition-colors">
            SP REST Explorer
          </Link>
          <nav className="flex items-center gap-0.5">
            {navLinks.map((link) => {
              // Special case: "Explore API" covers both / and /_api/*
              if (link.label === 'Explore API') {
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end
                    className={() => isExploreApiActive ? activeClass : inactiveClass}
                  >
                    {link.label}
                  </NavLink>
                )
              }
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    isActive ? activeClass : inactiveClass
                  }
                >
                  {link.label}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Center: Search trigger (hidden on home — hero has search there) */}
        <div className="flex items-center">
          {!isHome && (
            <button
              type="button"
              onClick={() => onSearchClick?.()}
              className="relative flex h-8 w-64 items-center rounded-md border border-input bg-muted/50 pl-9 pr-3 text-sm text-muted-foreground transition-colors cursor-pointer hover:border-ring hover:bg-muted/80"
            >
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
              <span className="flex-1 text-left text-muted-foreground/50">Search APIs...</span>
              <kbd className="ml-2 shrink-0 rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                {typeof navigator !== 'undefined' && (/Mac|iPod|iPhone|iPad/.test(navigator.platform || '') || /Mac/.test(navigator.userAgent || ''))
                  ? '\u2318K'
                  : 'Ctrl+K'}
              </kbd>
            </button>
          )}
        </div>

        {/* Right: Dark mode toggle + GitHub link */}
        <div className="flex items-center justify-end gap-1">
          <DarkModeToggle />
          <a
            href="https://github.com/s-KaiNet/sp-rest-explorer"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="View on GitHub"
          >
            {starCount !== null && (
              <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-current" />
                {formatStarCount(starCount)}
              </span>
            )}
            <Github className="h-5 w-5" />
          </a>
        </div>
      </div>
    </header>
  )
}
