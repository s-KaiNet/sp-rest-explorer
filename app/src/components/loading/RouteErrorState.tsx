import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import {
  Link,
  isRouteErrorResponse,
  useRouteError,
} from 'react-router'
import { Button } from '@/components/ui/button'

function getErrorSummary(error: unknown): {
  title: string
  message: string
  details?: string
} {
  if (isRouteErrorResponse(error)) {
    return {
      title: `${error.status} ${error.statusText || 'Route error'}`,
      message:
        typeof error.data === 'string'
          ? error.data
          : 'The requested view could not be loaded.',
      details: JSON.stringify(error.data, null, 2),
    }
  }

  if (error instanceof Error) {
    return {
      title: 'Something went wrong',
      message:
        'This view hit an unexpected error. You can reload the page or return home.',
      details: error.stack || error.message,
    }
  }

  return {
    title: 'Something went wrong',
    message:
      'This view hit an unexpected error. You can reload the page or return home.',
    details: String(error),
  }
}

export function RouteErrorState() {
  const error = useRouteError()
  const { title, message, details } = getErrorSummary(error)

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10 text-foreground">
      <section className="w-full max-w-xl rounded-lg border border-border bg-background p-6 shadow-sm">
        <div className="mb-5 flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-normal">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {message}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => window.location.reload()}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Reload page
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">
              <Home className="size-4" aria-hidden="true" />
              Go home
            </Link>
          </Button>
        </div>

        {import.meta.env.DEV && details ? (
          <details className="mt-5 rounded-md border border-border bg-muted/30 p-3">
            <summary className="cursor-pointer text-sm font-medium">
              Developer details
            </summary>
            <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-muted-foreground">
              {details}
            </pre>
          </details>
        ) : null}
      </section>
    </main>
  )
}
