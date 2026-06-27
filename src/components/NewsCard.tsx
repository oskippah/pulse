import { format } from 'date-fns'
import type { NewsArticle } from '../types'

interface Props {
  article: NewsArticle
  compact?: boolean
}

const CATEGORY_STYLE: Record<NewsArticle['category'], string> = {
  us:     'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  europe: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  etf:    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  crypto: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  ticker: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200',
}

const CATEGORY_LABEL: Record<NewsArticle['category'], string> = {
  us: 'US', europe: 'EU', etf: 'ETF', crypto: 'CRYPTO', ticker: '',
}

const SOURCE_STYLE: Record<string, string> = {
  Bloomberg: 'text-black dark:text-white font-bold',
  Reuters:   'text-[#FF6B00] font-bold',
}

export function NewsCard({ article, compact = false }: Props) {
  const ageMs = Date.now() - article.datetime * 1000
  const isBreaking = ageMs < 20 * 60 * 1000
  const timeStr = format(new Date(article.datetime * 1000), 'HH:mm')
  const label = article.category === 'ticker' && article.related
    ? article.related.toUpperCase()
    : CATEGORY_LABEL[article.category]
  const sourceStyle = SOURCE_STYLE[article.source] ?? 'text-gray-400 dark:text-zinc-500'

  if (compact) {
    return (
      <div className="flex items-start gap-2.5 py-3 border-b border-gray-100 dark:border-zinc-800/80 last:border-0">
        {isBreaking && (
          <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        )}
        <div className="flex-1 min-w-0">
          {/* Meta row */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`text-[10px] font-bold ${sourceStyle}`}>{article.source}</span>
            <span className="text-[10px] text-gray-300 dark:text-zinc-700">·</span>
            <span className={`text-[10px] font-medium ${isBreaking ? 'text-red-500' : 'text-gray-400 dark:text-zinc-500'}`}>
              {isBreaking ? `🔴 ${timeStr}` : timeStr}
            </span>
            {label && (
              <>
                <span className="text-[10px] text-gray-300 dark:text-zinc-700">·</span>
                <span className={`text-[9px] font-bold px-1 py-px rounded uppercase tracking-wide ${CATEGORY_STYLE[article.category]}`}>
                  {label}
                </span>
              </>
            )}
          </div>
          {/* Headline */}
          <p className="text-sm font-semibold text-black dark:text-white leading-snug">
            {article.headline}
          </p>
          {/* Summary */}
          {article.summary && article.summary !== article.headline && (
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed line-clamp-2">
              {article.summary}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4">
      {isBreaking && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">Breaking</span>
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={`text-xs font-bold ${sourceStyle}`}>{article.source}</span>
        <span className="text-xs text-gray-300 dark:text-zinc-700">·</span>
        <span className={`text-xs font-medium ${isBreaking ? 'text-red-500' : 'text-gray-400 dark:text-zinc-500'}`}>
          {timeStr}
        </span>
        {label && (
          <>
            <span className="text-xs text-gray-300 dark:text-zinc-700">·</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md uppercase tracking-wide ${CATEGORY_STYLE[article.category]}`}>
              {label}
            </span>
          </>
        )}
      </div>

      {/* Headline */}
      <p className="text-sm font-bold text-black dark:text-white leading-snug mb-2">
        {article.headline}
      </p>

      {/* Summary — the actual content, no link */}
      {article.summary && article.summary !== article.headline && (
        <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed line-clamp-4">
          {article.summary}
        </p>
      )}
    </div>
  )
}
