import { useState, useEffect } from 'react'
import { X, Share, Plus } from 'lucide-react'

export function InstallBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only on iOS Safari, only when NOT already installed as PWA
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isStandalone = (window.navigator as any).standalone === true
    const dismissed = localStorage.getItem('pulse:install-dismissed')
    if (isIOS && !isStandalone && !dismissed) {
      // Small delay so it doesn't pop up immediately on first load
      const t = setTimeout(() => setVisible(true), 2500)
      return () => clearTimeout(t)
    }
  }, [])

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem('pulse:install-dismissed', '1')
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-[100] px-4 pb-safe"
      style={{ paddingBottom: `calc(max(env(safe-area-inset-bottom, 0px), 8px) + 8px)` }}
    >
      <div
        className="rounded-2xl p-4 flex gap-3 items-start"
        style={{
          background: 'var(--c-surface)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
          border: '0.5px solid var(--c-sep)',
        }}
      >
        {/* App icon */}
        <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0">
          <img src="/apple-touch-icon.png" alt="Pulse" className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold mb-0.5" style={{ color: 'var(--c-text)' }}>
            Installeer Pulse
          </p>
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--c-text3)' }}>
            Tik op{' '}
            <span className="inline-flex items-center gap-0.5 font-semibold" style={{ color: 'var(--c-accent)' }}>
              <Share size={13} />
              Deel
            </span>
            {' '}→ dan{' '}
            <span className="inline-flex items-center gap-0.5 font-semibold" style={{ color: 'var(--c-accent)' }}>
              <Plus size={13} />
              Zet op beginscherm
            </span>
          </p>
        </div>

        <button
          onClick={dismiss}
          className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-full shrink-0"
          style={{ background: 'var(--c-surface2)', color: 'var(--c-text3)' }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
