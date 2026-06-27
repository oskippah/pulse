import { useQuotes } from '../hooks/useQuotes'
import type { Quote } from '../lib/quotes'

function getMarketStatus() {
  const bru = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Brussels' }))
  const h = bru.getHours() + bru.getMinutes() / 60
  const wk = bru.getDay() >= 1 && bru.getDay() <= 5
  return [
    { label: 'AEX',    open: wk && h >= 9 && h < 17.5 },
    { label: 'NYSE',   open: wk && h >= 15.5 && h < 22 },
    { label: 'Crypto', open: true },
  ]
}

function formatPrice(q: Quote) {
  if (q.price === 0) return '–'
  if (q.price > 1000) return `${q.currency}${q.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  return `${q.currency}${q.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function QuoteTile({ q }: { q: Quote }) {
  const up = q.changePercent >= 0
  const color = up ? 'var(--c-green)' : 'var(--c-red)'
  const bg    = up ? 'rgba(48,209,88,0.08)' : 'rgba(255,69,58,0.08)'

  return (
    <div
      className="flex flex-col shrink-0 px-3 py-2 rounded-xl"
      style={{ background: bg, minWidth: 76 }}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--c-text4)' }}>
        {q.symbol}
      </span>
      <span className="text-[14px] font-bold tabular-nums leading-tight" style={{ color: 'var(--c-text)' }}>
        {formatPrice(q)}
      </span>
      <span className="text-[11px] font-semibold tabular-nums mt-0.5" style={{ color }}>
        {up ? '▲' : '▼'} {Math.abs(q.changePercent).toFixed(2)}%
      </span>
    </div>
  )
}

export function MarketBar() {
  const quotes = useQuotes()
  const markets = getMarketStatus()
  const time = new Date().toLocaleTimeString('nl-BE', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Brussels',
  })

  return (
    <div style={{ background: 'var(--c-surface)', borderBottom: '0.5px solid var(--c-sep)' }}>
      {/* Market status row */}
      <div className="flex items-center px-4 py-2 gap-3">
        {markets.map((m) => (
          <div key={m.label} className="flex items-center gap-1.5">
            <span
              className="w-[7px] h-[7px] rounded-full shrink-0"
              style={{
                background: m.open ? 'var(--c-green)' : 'var(--c-red)',
                boxShadow: m.open ? '0 0 6px var(--c-green)' : 'none',
              }}
            />
            <span className="text-[12px] font-semibold" style={{ color: 'var(--c-text2)' }}>{m.label}</span>
            <span className="text-[11px]" style={{ color: m.open ? 'var(--c-green)' : 'var(--c-text4)' }}>
              {m.open ? 'open' : 'dicht'}
            </span>
          </div>
        ))}
        <span className="ml-auto text-[11px] tabular-nums font-medium" style={{ color: 'var(--c-text4)' }}>
          {time}
        </span>
      </div>

      {/* Price tiles — horizontal scroll */}
      {quotes.length > 0 && (
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
          {quotes.map((q) => <QuoteTile key={q.symbol} q={q} />)}
        </div>
      )}
    </div>
  )
}
