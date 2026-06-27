import { formatDistanceToNow } from 'date-fns'
import { nl } from 'date-fns/locale'
import type { NewsArticle } from '../types'
import { Sparkline } from './Sparkline'
import { useSparkline } from '../hooks/useSparkline'

interface Props {
  article: NewsArticle
  compact?: boolean
}

const CAT_COLOR: Record<NewsArticle['category'], string> = {
  us:     'var(--c-accent)',
  europe: 'var(--c-purple)',
  etf:    'var(--c-green)',
  crypto: 'var(--c-orange)',
  ticker: 'var(--c-text3)',
}

const CAT_LABEL: Record<NewsArticle['category'], string> = {
  us: 'US', europe: 'EU', etf: 'ETF', crypto: 'CRYPTO', ticker: '',
}

const SOURCE_STYLE: Record<string, { color: string; bg: string }> = {
  Bloomberg: { color: '#fff', bg: '#1a1a1a' },
  Reuters:   { color: '#fff', bg: '#FF6B00' },
}

function relativeTime(ts: number) {
  const diff = Date.now() - ts * 1000
  if (diff < 60_000) return 'nu'
  return formatDistanceToNow(new Date(ts * 1000), { locale: nl, addSuffix: false })
    .replace('ongeveer ', '')
    .replace('minder dan ', '<')
    + ' geleden'
}

// Compact: list row with accent bar
function CompactCard({ article }: { article: NewsArticle }) {
  const ageMs      = Date.now() - article.datetime * 1000
  const isBreaking = ageMs < 20 * 60_000
  const catColor   = CAT_COLOR[article.category]
  const label      = article.category === 'ticker' && article.related ? article.related : CAT_LABEL[article.category]
  const srcStyle   = SOURCE_STYLE[article.source]
  const timeStr    = relativeTime(article.datetime)

  return (
    <div className="flex gap-3 py-3.5" style={{ borderBottom: '0.5px solid var(--c-sep)' }}>
      <div className="flex flex-col items-center pt-0.5 shrink-0">
        <div className="w-0.5 flex-1 rounded-full" style={{ background: catColor, minHeight: 8 }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {srcStyle ? (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: srcStyle.bg, color: srcStyle.color }}>
              {article.source}
            </span>
          ) : (
            <span className="text-[11px] font-semibold" style={{ color: 'var(--c-text3)' }}>{article.source}</span>
          )}
          {label && (
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: catColor }}>{label}</span>
          )}
          {isBreaking && (
            <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full" style={{ background: 'var(--c-red)', color: '#fff' }}>
              ● Breaking
            </span>
          )}
          <span className="ml-auto text-[11px] tabular-nums shrink-0" style={{ color: 'var(--c-text4)' }}>
            {timeStr}
          </span>
        </div>

        <p className="text-[14px] font-semibold leading-[1.35] line-clamp-2" style={{ color: 'var(--c-text)' }}>
          {article.headline}
        </p>
        {article.summary && article.summary !== article.headline && (
          <p className="text-[12px] mt-1 leading-relaxed line-clamp-2" style={{ color: 'var(--c-text3)' }}>
            {article.summary}
          </p>
        )}
      </div>
    </div>
  )
}

// Full card with sparkline chart
function FullCard({ article }: { article: NewsArticle }) {
  const ageMs       = Date.now() - article.datetime * 1000
  const isBreaking  = ageMs < 20 * 60_000
  const catColor    = CAT_COLOR[article.category]
  const label       = article.category === 'ticker' && article.related ? article.related : CAT_LABEL[article.category]
  const srcStyle    = SOURCE_STYLE[article.source]
  const timeStr     = relativeTime(article.datetime)
  const tickerSymbol = article.category === 'ticker' ? article.related : undefined
  const prices      = useSparkline(tickerSymbol)

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--c-surface)',
        boxShadow: '0 1px 4px var(--c-shadow), 0 0 0 0.5px var(--c-sep)',
      }}
    >
      <div className="h-[3px]" style={{ background: catColor }} />

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2.5">
          {srcStyle ? (
            <span className="text-[11px] font-bold px-2 py-1 rounded-md" style={{ background: srcStyle.bg, color: srcStyle.color }}>
              {article.source}
            </span>
          ) : (
            <span className="text-[12px] font-bold" style={{ color: 'var(--c-text2)' }}>{article.source}</span>
          )}
          {label && (
            <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: catColor }}>{label}</span>
          )}
          {isBreaking && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: 'var(--c-red)', color: '#fff' }}>
              ● Breaking
            </span>
          )}
          <span className="ml-auto text-[11px] tabular-nums" style={{ color: 'var(--c-text4)' }}>{timeStr}</span>
        </div>

        <p className="text-[16px] font-bold leading-[1.3] mb-2" style={{ color: 'var(--c-text)', letterSpacing: '-0.2px' }}>
          {article.headline}
        </p>

        {article.summary && article.summary !== article.headline && (
          <p className="text-[13px] leading-relaxed line-clamp-4" style={{ color: 'var(--c-text2)' }}>
            {article.summary}
          </p>
        )}

        {/* Sparkline chart for ticker articles */}
        {prices.length > 1 && (
          <div
            className="mt-3 pt-3"
            style={{ borderTop: '0.5px solid var(--c-sep)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--c-text4)' }}>
                {tickerSymbol} — koersverloop
              </span>
            </div>
            <Sparkline prices={prices} width={180} height={48} />
          </div>
        )}
      </div>
    </div>
  )
}

export function NewsCard({ article, compact = false }: Props) {
  if (compact) return <CompactCard article={article} />
  return <FullCard article={article} />
}
