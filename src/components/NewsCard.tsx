import { format } from 'date-fns'
import type { NewsArticle } from '../types'

interface Props {
  article: NewsArticle
  compact?: boolean
}

const CATEGORY_COLOR: Record<NewsArticle['category'], string> = {
  us:     'var(--c-accent)',
  europe: 'var(--c-purple)',
  etf:    'var(--c-green)',
  crypto: 'var(--c-orange)',
  ticker: 'var(--c-text3)',
}

const CATEGORY_LABEL: Record<NewsArticle['category'], string> = {
  us: 'US', europe: 'EU', etf: 'ETF', crypto: 'CRYPTO', ticker: '',
}

const SOURCE_COLOR: Record<string, string> = {
  Bloomberg: 'var(--c-text)',
  Reuters:   'var(--c-orange)',
}

export function NewsCard({ article, compact = false }: Props) {
  const ageMs = Date.now() - article.datetime * 1000
  const isBreaking = ageMs < 20 * 60 * 1000
  const timeStr = format(new Date(article.datetime * 1000), 'HH:mm')
  const label = article.category === 'ticker' && article.related
    ? article.related.toUpperCase()
    : CATEGORY_LABEL[article.category]
  const sourceColor = SOURCE_COLOR[article.source] ?? 'var(--c-text3)'
  const catColor = CATEGORY_COLOR[article.category]

  if (compact) {
    return (
      <div
        className="flex items-start gap-3 py-3.5"
        style={{ borderBottom: '0.5px solid var(--c-sep)' }}
      >
        {/* Category bar */}
        <div
          className="shrink-0 w-[3px] self-stretch rounded-full mt-0.5"
          style={{ background: catColor }}
        />

        <div className="flex-1 min-w-0">
          {/* Meta */}
          <div className="flex items-center gap-1.5 mb-1">
            {isBreaking && (
              <span
                className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                style={{ background: 'var(--c-red)', color: '#fff' }}
              >
                Breaking
              </span>
            )}
            <span className="text-[11px] font-bold" style={{ color: sourceColor }}>
              {article.source}
            </span>
            {label && (
              <>
                <span style={{ color: 'var(--c-text4)' }} className="text-[10px]">·</span>
                <span className="text-[10px] font-semibold" style={{ color: catColor }}>{label}</span>
              </>
            )}
            <span style={{ color: 'var(--c-text4)' }} className="text-[10px] ml-auto tabular-nums">
              {isBreaking
                ? <span style={{ color: 'var(--c-red)' }}>● {timeStr}</span>
                : timeStr
              }
            </span>
          </div>

          {/* Headline */}
          <p className="text-[14px] font-semibold leading-snug line-clamp-2" style={{ color: 'var(--c-text)' }}>
            {article.headline}
          </p>

          {/* Summary */}
          {article.summary && article.summary !== article.headline && (
            <p className="text-[13px] mt-1 leading-relaxed line-clamp-2" style={{ color: 'var(--c-text3)' }}>
              {article.summary}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: 'var(--c-surface)',
        boxShadow: '0 1px 3px var(--c-shadow)',
        borderLeft: `4px solid ${catColor}`,
      }}
    >
      {/* Meta row */}
      <div className="flex items-center gap-2 mb-2">
        {isBreaking && (
          <span
            className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
            style={{ background: 'var(--c-red)', color: '#fff' }}
          >
            Breaking
          </span>
        )}
        <span className="text-xs font-bold" style={{ color: sourceColor }}>{article.source}</span>
        {label && (
          <>
            <span className="text-xs" style={{ color: 'var(--c-sep)' }}>·</span>
            <span className="text-[11px] font-semibold" style={{ color: catColor }}>{label}</span>
          </>
        )}
        <span
          className="ml-auto text-[11px] tabular-nums"
          style={{ color: isBreaking ? 'var(--c-red)' : 'var(--c-text4)' }}
        >
          {timeStr}
        </span>
      </div>

      {/* Headline */}
      <p className="text-[15px] font-bold leading-snug mb-2" style={{ color: 'var(--c-text)' }}>
        {article.headline}
      </p>

      {/* Summary */}
      {article.summary && article.summary !== article.headline && (
        <p className="text-[13px] leading-relaxed line-clamp-4" style={{ color: 'var(--c-text2)' }}>
          {article.summary}
        </p>
      )}
    </div>
  )
}
