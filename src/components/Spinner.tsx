export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-gray-200 dark:border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
      <p className="text-gray-500 dark:text-gray-400 text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-blue-500 text-sm font-medium"
        >
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-16 px-6">
      <p className="text-gray-400 dark:text-gray-500 text-sm text-center">{message}</p>
    </div>
  )
}
