import { format } from 'date-fns'
import { RefreshCw } from 'lucide-react'
import { Header } from '../components/Header'
import { NewsCard } from '../components/NewsCard'
import { MatchCard } from '../components/MatchCard'
import { EmptyState, ErrorState, Spinner } from '../components/Spinner'
import { useNews } from '../hooks/useNews'
import { useMatches } from '../hooks/useMatches'
import type { Match, NewsFilters } from '../types'

interface Props {
  filters: NewsFilters
  favoriteTeamIds: number[]
  onMatchClick: (match: Match) => void
}

export function Markets({ filters, favoriteTeamIds, onMatchClick }: Props) {
  const { articles, loading, error, lastUpdated, refresh } = useNews(filters)
  const { matches } = useMatches()

  const anyEnabled =
    filters.us || filters.europe || filters.etfs || filters.crypto || filters.tickers.length > 0

  // Matches for favorited teams — live first, then upcoming, then finished
  const favoriteMatches = matches
    .filter((m) =>
      favoriteTeamIds.includes(m.homeTeam.id) || favoriteTeamIds.includes(m.awayTeam.id)
    )
    .sort((a, b) => {
      const priority = (m: Match) =>
        m.status === 'IN_PLAY' || m.status === 'PAUSED' ? 0
        : m.status === 'SCHEDULED' || m.status === 'TIMED' ? 1
        : 2
      return priority(a) - priority(b) || new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
    })
    .slice(0, 5)

  const subtitle = lastUpdated ? `Updated ${format(lastUpdated, 'HH:mm')}` : undefined

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Markets"
        subtitle={subtitle}
        right={
          <button onClick={refresh} className="text-blue-500 p-1" aria-label="Refresh">
            <RefreshCw size={17} />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto scroll-smooth-ios pb-24">

        {/* Favorite matches section */}
        {favoriteMatches.length > 0 && (
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs font-semibold text-yellow-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              ★ Favorieten
            </p>
            <div className="flex flex-col gap-2">
              {favoriteMatches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  onClick={onMatchClick}
                  isFavorite
                  compact
                />
              ))}
            </div>
            <div className="border-b border-gray-100 dark:border-zinc-800 mt-4" />
          </div>
        )}

        {/* News */}
        {favoriteTeamIds.length === 0 && favoriteMatches.length === 0 && (
          <div className="px-4 pt-4 pb-1">
            <p className="text-xs text-gray-400 dark:text-zinc-500">
              ☆ Stel een favoriet team in via het World Cup tabblad — dan zie je die matches hier.
            </p>
          </div>
        )}

        {loading && <Spinner />}

        {!loading && error && (
          <ErrorState
            message={error.includes('API') ? 'Controleer je Finnhub API key.' : error}
            onRetry={refresh}
          />
        )}

        {!loading && !error && !anyEnabled && (
          <EmptyState message="Geen categorieën geselecteerd. Ga naar Instellingen om nieuwscategorieën in te schakelen." />
        )}

        {!loading && !error && anyEnabled && articles.length === 0 && (
          <EmptyState message="Geen artikelen gevonden. Probeer te vernieuwen of schakel meer categorieën in." />
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
