export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded-md w-48 animate-pulse" />
        <div className="h-4 bg-muted rounded-md w-64 animate-pulse" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-96 bg-muted rounded-lg animate-pulse" />
          <div className="h-64 bg-muted rounded-lg animate-pulse" />
          <div className="h-80 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="space-y-6">
          <div className="h-48 bg-muted rounded-lg animate-pulse" />
          <div className="h-32 bg-muted rounded-lg animate-pulse" />
          <div className="h-40 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  )
}
