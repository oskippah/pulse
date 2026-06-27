import { useQuotes } from '../hooks/useQuotes'
import type { Quote } from '../lib/quotes'

function getMarketStatus() {
  const now = new Date()
  const bru = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Brussels' }))
  const h = bru.getHours() + bru.getMinutes() / 60
  const wd = bru.getDay()
  const wk = wd >= 1 && wd <= 5
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
  return (
    <div className="flex flex-col shrink-0 min-w-[68px]">
      <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--c-text4)' }}>{q.symbol}</span>
      <span className="text-[13px] font-bold leading-tight" style={{ color: 'var(--c-text)' }}>{formatPrice(q)}</span>
      <span className="text-[11px] font-semibold" style={{ color }}>
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
      {/* Status row */}
      <div className="flex items-center gap-4 px-4 py-2">
        {markets.map((m) => (
          <div key={m.label} className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: m.open ? 'var(--c-green)' : 'var(--c-red)' }}
            />
            <span className="text-[11px] font-semibold" style={{ color: 'var(--c-text2)' }}>{m.label}</span>
            <span className="text-[10px] font-medium" style={{ color: m.open ? 'var(--c-green)' : 'var(--c-text4)' }}>
              {m.open ? 'OPEN' : 'DICHT'}
            </span>
          </div>
        ))}
        <span className="ml-auto text-[10px] font-medium tabular-nums" style={{ color: 'var(--c-text4)' }}>
          {time} BRU
        </span>
      </div>

      {/* Price ticker */}
      {quotes.length > 0 && (
        <div className="flex gap-5 px-4 pb-2.5 overflow-x-auto scrollbar-none">
          {quotes.map((q) => <QuoteTile key={q.symbol} q={q} />)}
        </div>
      )}
    </div>
  )
}
