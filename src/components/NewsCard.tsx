import type { NewsArticle } from '../types'
import { formatDistanceToNow } from 'date-fns'

interface Props {
  article: NewsArticle
}

const CATEGORY_COLORS: Record<NewsArticle['category'], string> = {
  us: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  europe: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  etf: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  crypto: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  ticker: 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-gray-200',
}

const CATEGORY_LABELS: Record<NewsArticle['category'], string> = {
  us: 'US',
  europe: 'Europe',
  etf: 'ETF',
  crypto: 'Crypto',
  ticker: '',
}

export function NewsCard({ article }: Props) {
  const timeAgo = formatDistanceToNow(new Date(article.datetime * 1000), { addSuffix: true })
  const label = article.category === 'ticker' && article.related
    ? article.related.toUpperCase()
    : CATEGORY_LABELS[article.category]

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-4 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors active:scale-[0.98] transform"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md uppercase tracking-wide ${CATEGORY_COLORS[article.category]}`}>
              {label}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{article.source}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">·</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{timeAgo}</span>
          </div>
          <p className="text-sm font-semibold text-black dark:text-white leading-snug line-clamp-3">
            {article.headline}
          </p>
        </div>
        {article.image && (
          <img
            src={article.image}
            alt=""
            className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-gray-100 dark:bg-zinc-800"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        )}
      </div>
    </a>
  )
}
