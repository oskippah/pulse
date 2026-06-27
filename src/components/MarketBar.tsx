import { useQuotes } from '../hooks/useQuotes'
import type { Quote } from '../lib/quotes'

// Market sessions in Brussels time (Europe/Brussels = UTC+2 in summer)
function getMarketStatus(): { label: string; open: boolean }[] {
  const now = new Date()
  const brussels = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Brussels' }))
  const h = brussels.getHours() + brussels.getMinutes() / 60
  const day = brussels.getDay() // 0=sun, 6=sat
  const isWeekday = day >= 1 && day <= 5

  return [
    {
      label: 'AEX',
      open: isWeekday && h >= 9 && h < 17.5,
    },
    {
      label: 'NYSE',
      // NYSE 09:30–16:00 ET = 15:30–22:00 Brussels (CEST, UTC+2)
      open: isWeekday && h >= 15.5 && h < 22,
    },
    {
      label: 'Crypto',
      open: true,
    },
  ]
}

function formatPrice(q: Quote): string {
  if (q.price === 0) return '–'
  if (q.price > 1000) return `${q.currency}${q.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  return `${q.currency}${q.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function QuoteTile({ q }: { q: Quote }) {
  const up = q.changePercent >= 0
  return (
    <div className="flex flex-col shrink-0 min-w-[70px]">
      <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">{q.symbol}</span>
      <span className="text-xs font-bold text-black dark:text-white leading-tight">{formatPrice(q)}</span>
      <span className={`text-[10px] font-semibold ${up ? 'text-green-500' : 'text-red-500'}`}>
        {up ? '+' : ''}{q.changePercent.toFixed(2)}%
      </span>
    </div>
  )
}

export function MarketBar() {
  const quotes = useQuotes()
  const markets = getMarketStatus()

  return (
    <div className="bg-white dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-800">
      {/* Market status row */}
      <div className="flex items-center gap-3 px-4 py-1.5 border-b border-gray-100 dark:border-zinc-800/60">
        {markets.map((m) => (
          <div key={m.label} className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${m.open ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-[10px] font-semibold text-gray-500 dark:text-zinc-400">{m.label}</span>
            <span className={`text-[10px] ${m.open ? 'text-green-500' : 'text-gray-400 dark:text-zinc-600'}`}>
              {m.open ? 'OPEN' : 'GESLOTEN'}
            </span>
          </div>
        ))}
        <span className="ml-auto text-[10px] text-gray-300 dark:text-zinc-700">
          {new Date().toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Brussels' })} BRU
        </span>
      </div>

      {/* Price ticker row */}
      {quotes.length > 0 && (
        <div className="flex gap-4 px-4 py-2 overflow-x-auto scrollbar-none">
          {quotes.map((q) => <QuoteTile key={q.symbol} q={q} />)}
        </div>
      )}
    </div>
  )
}
