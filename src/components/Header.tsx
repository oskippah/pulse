interface Props {
  title: string
  subtitle?: string
  right?: React.ReactNode
}

export function Header({ title, subtitle, right }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-black/85 backdrop-blur-xl border-b border-gray-200/60 dark:border-zinc-800/60">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black dark:text-white leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {right && <div>{right}</div>}
      </div>
    </header>
  )
}
