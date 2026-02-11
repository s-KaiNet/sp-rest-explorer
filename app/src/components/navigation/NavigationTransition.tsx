interface SidebarTransitionProps {
  children: React.ReactNode
  pathKey: string
  direction: 'left' | 'right' | 'none'
}

/**
 * Wraps sidebar content with directional slide animation.
 * Uses key-based remounting with tw-animate-css classes.
 *
 * - Going deeper (direction='left'): slides in from right
 * - Going back (direction='right'): slides in from left
 * - Initial/none: no animation
 */
export function SidebarTransition({
  children,
  pathKey,
  direction,
}: SidebarTransitionProps) {
  const animationClass =
    direction === 'left'
      ? 'animate-in slide-in-from-right duration-150'
      : direction === 'right'
        ? 'animate-in slide-in-from-left duration-150'
        : ''

  return (
    <div key={pathKey} className={`flex min-h-full flex-1 flex-col ${animationClass}`}>
      {children}
    </div>
  )
}

interface ContentTransitionProps {
  children: React.ReactNode
  pathKey: string
}

/**
 * Wraps content area with fade animation on navigation.
 * Uses key-based remounting with tw-animate-css fade-in.
 */
export function ContentTransition({
  children,
  pathKey,
}: ContentTransitionProps) {
  return (
    <div key={pathKey} className="animate-in fade-in duration-150">
      {children}
    </div>
  )
}
