import type { ChangeType } from '@/lib/diff'

interface ChangeBadgeProps {
  changeType: ChangeType
}

const badgeStyles: Record<ChangeType, string> = {
  added: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  updated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  removed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const badgeLabels: Record<ChangeType, string> = {
  added: 'Added',
  updated: 'Updated',
  removed: 'Removed',
}

/**
 * Color-coded pill badge for change types: Added (green), Updated (blue), Removed (red).
 */
export function ChangeBadge({ changeType }: ChangeBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeStyles[changeType]}`}
    >
      {badgeLabels[changeType]}
    </span>
  )
}
