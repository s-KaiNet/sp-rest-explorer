/** Simple centered spinner shown while metadata loads. */
export function LoadingState() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="size-8 rounded-full border-3 border-muted border-t-muted-foreground animate-spin" />
    </div>
  )
}
