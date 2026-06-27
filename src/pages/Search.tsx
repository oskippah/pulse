import { useMemo, useState } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { Header } from '../components/Header'
import { MatchCard } from '../components/MatchCard'
import { NewsCard } from '../components/NewsCard'
import { EmptyState } from '../components/Spinner'
import { useNews } from '../hooks/useNews'
import { useMatches } from '../hooks/useMatches'
import type { Match, NewsFilters } from '../types'

interface Props {
  filters: NewsFilters
  onMatchSelect: (match: Match) => void
}

export function Search({ filters, onMatchSelect }: Props) {
  const [query, setQuery] = useState('')
  const { articles } = useNews(filters)
  const { matches } = useMatches()
  const q = query.trim().toLowerCase()

  const filteredArticles = useMemo(() => {
    if (!q) return []
    return articles.filter(
      (a) => a.headline.toLowerCase().includes(q) || a.source.toLowerCase().includes(q) || a.related?.toLowerCase().includes(q)
    ).slice(0, 20)
  }, [articles, q])

  const filteredMatches = useMemo(() => {
    if (!q) return []
    return matches.filter(
      (m) =>
        m.homeTeam.name.toLowerCase().includes(q) ||
        m.awayTeam.name.toLowerCase().includes(q) ||
        m.homeTeam.tla?.toLowerCase().includes(q) ||
        m.awayTeam.tla?.toLowerCase().includes(q)
    )
  }, [matches, q])

  const hasResults = filteredArticles.length > 0 || filteredMatches.length > 0

  return (
    <div className="flex flex-col h-full">
      <Header title="Zoeken" />

      <div className="px-4 py-3" style={{ background: 'var(--c-surface)', borderBottom: '0.5px solid var(--c-sep)' }}>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'var(--c-surface2)' }}>
          <SearchIcon size={16} color="var(--c-text3)" />
          <input
            type="search"
            placeholder="Teams, nieuws, tickers…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-[15px] bg-transparent outline-none"
            style={{ color: 'var(--c-text)' }}
            autoFocus
          />
        </div>
      </div>

      <div className="flex-1 scroll-ios mb-nav">
        {!q && <EmptyState icon="🔍" message="Typ om te zoeken in nieuws en WK-teams." />}
        {q && !hasResults && <EmptyState icon="📭" message={`Geen resultaten voor "${query}"`} />}

        {filteredMatches.length > 0 && (
          <div className="px-4 pt-4">
            <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--c-text3)' }}>Wedstrijden</p>
            <div className="space-y-2 mb-4">
              {filteredMatches.map((m) => <MatchCard key={m.id} match={m} onClick={onMatchSelect} />)}
            </div>
          </div>
        )}

        {filteredArticles.length > 0 && (
          <div className="px-4 pt-2">
            <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--c-text3)' }}>Nieuws</p>
            <div className="space-y-3">
              {filteredArticles.map((a) => <NewsCard key={a.id} article={a} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
