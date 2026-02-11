import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <h2 className="text-lg font-medium text-foreground">Page not found</h2>
      <p className="mt-2 text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="mt-4 text-sm text-primary underline underline-offset-4 hover:text-primary/80"
      >
        Go back home
      </Link>
    </div>
  )
}
