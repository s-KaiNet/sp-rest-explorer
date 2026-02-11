import { NavLink } from 'react-router'
import { Search, Github } from 'lucide-react'
import { DarkModeToggle } from '@/components/theme'

const navLinks: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: 'Explore API', end: true },
  { to: '/entity', label: 'Explore Types' },
  { to: '/api-diff', label: 'API Changelog' },
  { to: '/how-it-works', label: 'How it works' },
]

export function Header() {
  return (
    <header className="fixed top-0 z-50 flex h-14 w-full items-center border-b border-border bg-background">
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-4">
        {/* Left: App name + Nav links */}
        <div className="flex items-center gap-1">
          <span className="mr-3 text-sm font-semibold text-foreground whitespace-nowrap">
            SP REST Explorer
          </span>
          <nav className="flex items-center gap-0.5">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end ?? false}
                className={({ isActive }) =>
                  isActive
                    ? 'rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground'
                    : 'rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors'
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Center: Search placeholder */}
        <div className="flex items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
            <input
              type="text"
              disabled
              placeholder="Search APIs... (Cmd+K)"
              className="h-8 w-64 rounded-md border border-input bg-muted/50 pl-9 pr-3 text-sm text-muted-foreground placeholder:text-muted-foreground/50 opacity-60 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Right: Dark mode toggle + GitHub link */}
        <div className="flex items-center justify-end gap-1">
          <DarkModeToggle />
          <a
            href="https://github.com/nicknisi/sp-rest-explorer"
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
