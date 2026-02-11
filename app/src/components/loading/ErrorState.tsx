import { AlertCircle, RefreshCw } from 'lucide-react'
import { retryBoot } from '@/lib/metadata'

/** Error state shown when metadata fetch fails. */
export function ErrorState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <AlertCircle className="size-12 text-destructive" />
      <h2 className="text-lg font-semibold">Failed to load API metadata</h2>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        Failed to load API metadata from Azure. Check your connection and try
        again.
      </p>
      <button
        type="button"
        onClick={() => void retryBoot()}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <RefreshCw className="size-4" />
        Try again
      </button>
    </div>
  )
}
