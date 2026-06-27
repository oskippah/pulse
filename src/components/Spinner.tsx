export function Spinner() {
  return (
    <div className="px-4 pt-4 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-2xl p-4 space-y-2.5" style={{ background: 'var(--c-surface)' }}>
          <div className="flex items-center gap-2">
            <div className="skeleton h-2.5 w-16 rounded" />
            <div className="skeleton h-2.5 w-8 rounded" />
          </div>
          <div className="skeleton h-3.5 w-full rounded" />
          <div className="skeleton h-3.5 w-4/5 rounded" />
          <div className="skeleton h-3 w-3/5 rounded opacity-70" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonLine({ w = 'w-full', h = 'h-3' }: { w?: string; h?: string }) {
  return <div className={`skeleton ${h} ${w} rounded`} />
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-4">
      <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
        style={{ background: 'var(--c-surface)' }}>
        ⚠️
      </div>
      <div>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--c-text)' }}>Laden mislukt</p>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--c-text3)' }}>{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-semibold px-5 py-2.5 rounded-full"
          style={{ background: 'var(--c-accent)', color: '#fff' }}
        >
          Opnieuw proberen
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message, icon }: { message: string; icon?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-3">
      {icon && <p className="text-4xl">{icon}</p>}
      <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text3)' }}>{message}</p>
    </div>
  )
}
