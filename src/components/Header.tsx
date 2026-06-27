interface Props {
  title: string
  subtitle?: string
  right?: React.ReactNode
}

const navStyle: React.CSSProperties = {
  background: 'var(--c-nav)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
}

export function Header({ title, subtitle, right }: Props) {
  return (
    <header className="sticky top-0 z-40" style={navStyle}>
      {/*
        Safe-area spacer: fills the Dynamic Island / notch / status-bar zone.
        Zero height on iPhone SE (no notch), ~59px on iPhone 16 Pro.
        Interactive elements NEVER go here — this zone belongs to iOS.
      */}
      <div style={{ height: 'env(safe-area-inset-top, 0px)' }} />

      {/* Navigation bar content — always starts below the status bar */}
      <div
        className="flex items-center justify-between px-4"
        style={{
          height: 52,
          borderBottom: '0.5px solid var(--c-sep)',
        }}
      >
        <div className="min-w-0 flex-1">
          <h1
            className="text-[19px] font-bold tracking-tight leading-tight truncate"
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

        {right && (
          <div className="ml-2 shrink-0 flex items-center">
            {right}
          </div>
        )}
      </div>
    </header>
  )
}
