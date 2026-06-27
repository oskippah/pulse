import { format } from 'date-fns'
import { Header } from '../components/Header'
import { NewsCard } from '../components/NewsCard'
import { EmptyState, ErrorState, Spinner } from '../components/Spinner'
import { useNews } from '../hooks/useNews'
import type { NewsFilters } from '../types'

interface Props {
  filters: NewsFilters
}

export function Markets({ filters }: Props) {
  const { articles, loading, error, lastUpdated, refresh } = useNews(filters)

  const anyEnabled =
    filters.us || filters.europe || filters.etfs || filters.crypto || filters.tickers.length > 0

  const subtitle = lastUpdated
    ? `Updated ${format(lastUpdated, 'HH:mm')}`
    : undefined

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Markets"
        subtitle={subtitle}
        right={
          <button
            onClick={refresh}
            className="text-blue-500 text-sm font-medium p-1"
            aria-label="Refresh"
          >
            ↻
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto scroll-smooth-ios pb-24">
        {loading && <Spinner />}

        {!loading && error && (
          <ErrorState
            message={error.includes('API key') ? 'Add your Finnhub API key in .env to see news.' : error}
            onRetry={refresh}
          />
        )}

        {!loading && !error && !anyEnabled && (
          <EmptyState message="No categories selected. Go to Settings to choose what news you want to see." />
        )}

        {!loading && !error && anyEnabled && articles.length === 0 && (
          <EmptyState message="No articles found. Try refreshing or enabling more categories in Settings." />
        )}

        {!loading && !error && articles.length > 0 && (
          <div className="px-4 py-3 flex flex-col gap-3">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
