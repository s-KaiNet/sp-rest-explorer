import { Box, Braces, Compass, HelpCircle, Zap, type LucideProps } from 'lucide-react'
import type { ApiType } from '@/lib/api-types'
import { cn } from '@/lib/utils'

const iconMap: Record<ApiType, React.ComponentType<LucideProps>> = {
  root: Box,
  nav: Compass,
  function: Zap,
  entity: Braces,
}

const colorMap: Record<ApiType, string> = {
  root: 'text-type-root',
  nav: 'text-type-nav',
  function: 'text-type-fn',
  entity: 'text-type-entity',
}

const sizeMap = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-9',
} as const

/**
 * Renders a Lucide icon for a given API type in its designated color.
 *
 * @example
 * <TypeIcon type="root" />                // small green Box
 * <TypeIcon type="function" size="md" />  // medium blue Zap
 * <TypeIcon type="entity" size="lg" />    // large orange Braces
 */
export function TypeIcon({
  type,
  size = 'sm',
  className,
}: {
  type: ApiType
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const Icon = iconMap[type] ?? HelpCircle
  const color = colorMap[type] ?? 'text-muted-foreground'

  return <Icon className={cn(sizeMap[size], color, className)} />
}
