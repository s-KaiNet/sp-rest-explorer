interface SectionJumpLinksProps {
  propertiesCount: number
  navPropertiesCount: number
  methodsCount: number
}

interface JumpPill {
  label: string
  target: string
  count: number
}

/**
 * Section jump pill links with count badges.
 * All three pills always shown — empty sections are dimmed.
 */
export function SectionJumpLinks({
  propertiesCount,
  navPropertiesCount,
  methodsCount,
}: SectionJumpLinksProps) {
  const pills: JumpPill[] = [
    { label: 'Properties', target: 'props-section', count: propertiesCount },
    { label: 'Navigation Properties', target: 'navprops-section', count: navPropertiesCount },
    { label: 'Methods', target: 'methods-section', count: methodsCount },
  ]

  return (
    <div className="mb-5 flex flex-wrap gap-1">
      {pills.map((pill) => (
        <a
          key={pill.target}
          href={`#${pill.target}`}
          onClick={(e) => {
            e.preventDefault()
            document.getElementById(pill.target)?.scrollIntoView({ behavior: 'smooth' })
          }}
          className={`inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:border-ring hover:bg-accent hover:text-accent-foreground ${
            pill.count === 0 ? 'text-muted-foreground opacity-50' : 'text-secondary-foreground'
          }`}
        >
          {pill.label}
          <span className="rounded-full bg-muted px-1.5 text-[10.5px] text-muted-foreground">
            {pill.count}
          </span>
        </a>
      ))}
    </div>
  )
}
