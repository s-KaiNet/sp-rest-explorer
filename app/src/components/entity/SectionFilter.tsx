import { Search } from 'lucide-react'

interface SectionFilterProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
}

/**
 * Small inline search input for filtering within a section header.
 * 160px default width, expands to 200px on focus.
 */
export function SectionFilter({ value, onChange, placeholder }: SectionFilterProps) {
  return (
    <div className="relative flex items-center gap-1.5">
      <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-40 rounded-md border border-border bg-background py-1 pl-7 pr-2 text-xs outline-none transition-all focus:w-50 focus:border-ring"
      />
    </div>
  )
}
