interface Props {
  title: string
  subtitle?: string
  right?: React.ReactNode
}

export function Header({ title, subtitle, right }: Props) {
  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: 'var(--c-nav)',
        borderBottom: '0.5px solid var(--c-sep)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        /* Safe area: content sits below Dynamic Island / notch / status bar */
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 min-h-[52px]">
        <div className="min-w-0 flex-1">
          <h1
            className="text-xl font-bold tracking-tight leading-tight truncate"
            style={{ color: 'var(--c-text)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--c-text3)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {right && <div className="ml-2 shrink-0">{right}</div>}
      </div>
    </header>
  )
}
