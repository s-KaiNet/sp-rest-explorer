import { NavLink, useLocation } from 'react-router'
import { Search, Github } from 'lucide-react'
import { DarkModeToggle } from '@/components/theme'

const navLinks: { to: string; label: string }[] = [
  { to: '/', label: 'Explore API' },
  { to: '/entity', label: 'Explore Types' },
  { to: '/api-diff', label: 'API Changelog' },
  { to: '/how-it-works', label: 'How it works' },
]

const activeClass = 'rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground'
const inactiveClass = 'rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors'

export function Header() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  // "Explore API" should be active on both / (home) and /_api/* (browsing)
  const isExploreApiActive = pathname === '/' || pathname.startsWith('/_api')

  return (
    <header className="fixed top-0 z-50 flex h-14 w-full items-center border-b border-border bg-background">
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-4">
        {/* Left: App name + Nav links */}
        <div className="flex items-center gap-1">
          <span className="mr-3 text-sm font-semibold text-foreground whitespace-nowrap">
            SP REST Explorer
          </span>
          <nav className="flex items-center gap-0.5">
            {navLinks.map((link) => {
              // Special case: "Explore API" covers both / and /_api/*
              if (link.to === '/') {
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end
                    className={isExploreApiActive ? activeClass : inactiveClass}
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

        {/* Center: Search placeholder (hidden on home — hero has search there) */}
        <div className="flex items-center">
          {!isHome && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
              <input
                type="text"
                disabled
                placeholder="Search APIs... (Cmd+K)"
                className="h-8 w-64 rounded-md border border-input bg-muted/50 pl-9 pr-3 text-sm text-muted-foreground placeholder:text-muted-foreground/50 opacity-60 cursor-not-allowed"
              />
            </div>
          )}
        </div>

        {/* Right: Dark mode toggle + GitHub link */}
        <div className="flex items-center justify-end gap-1">
          <DarkModeToggle />
          <a
            href="https://github.com/s-KaiNet/sp-rest-explorer"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="View on GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>
      </div>
    </header>
  )
}
