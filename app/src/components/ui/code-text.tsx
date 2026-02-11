import { cn } from '@/lib/utils'

const variantStyles = {
  default: '',
  fn: 'text-type-fn',
  entity: 'text-type-entity',
  nav: 'text-type-nav',
} as const

interface CodeTextProps {
  children: React.ReactNode
  className?: string
  variant?: keyof typeof variantStyles
}

export function CodeText({ children, className, variant = 'default' }: CodeTextProps) {
  return (
    <code
      className={cn(
        'rounded px-1.5 py-0.5 font-mono text-[0.9em] bg-code-bg',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </code>
  )
}
