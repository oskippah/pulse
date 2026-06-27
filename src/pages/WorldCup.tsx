import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { Header } from '../components/Header'
import { MatchCard } from '../components/MatchCard'
import { EmptyState, ErrorState, Spinner } from '../components/Spinner'
import { useMatchDetail, useMatches } from '../hooks/useMatches'
import type { Match, MatchDetail, Standing } from '../types'

const TZ = 'Europe/Brussels'

function formatLocal(utcDate: string, fmt: string) {
  return format(toZonedTime(parseISO(utcDate), TZ), fmt)
}

function MatchDetailView({ match, detail, loading, onBack }: {
  match: Match
  detail: MatchDetail | null
  loading: boolean
  onBack: () => void
}) {
  const hasLineup = (detail?.homeTeam as any)?.lineup?.length > 0

  return (
    <div className="flex flex-col h-full">
      <Header
        title={`${match.homeTeam.tla} vs ${match.awayTeam.tla}`}
        subtitle={formatLocal(match.utcDate, 'EEEE dd MMM · HH:mm')}
        right={
          <button onClick={onBack} className="text-blue-500 text-sm font-medium">
            ← Back
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto scroll-smooth-ios pb-24 px-4 py-4">
        {/* Score */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 text-center mb-4">
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-2">
              {match.homeTeam.crest && (
                <img src={match.homeTeam.crest} alt={match.homeTeam.name} className="w-14 h-14 object-contain" />
              )}
              <span className="text-sm font-semibold text-black dark:text-white">
                {match.homeTeam.shortName || match.homeTeam.name}
              </span>
            </div>

            <div className="text-center">
              {match.status === 'FINISHED' || match.status === 'IN_PLAY' || match.status === 'PAUSED' ? (
                <span className="text-4xl font-bold text-black dark:text-white">
                  {match.score.fullTime.home ?? 0} – {match.score.fullTime.away ?? 0}
                </span>
              ) : (
                <span className="text-lg text-gray-400">vs</span>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {match.status === 'FINISHED' ? 'Full Time' :
                 match.status === 'IN_PLAY' ? '● LIVE' :
                 match.status === 'PAUSED' ? 'Half Time' :
                 formatLocal(match.utcDate, 'HH:mm')}
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              {match.awayTeam.crest && (
                <img src={match.awayTeam.crest} alt={match.awayTeam.name} className="w-14 h-14 object-contain" />
              )}
              <span className="text-sm font-semibold text-black dark:text-white">
                {match.awayTeam.shortName || match.awayTeam.name}
              </span>
            </div>
          </div>
        </div>

        {loading && <Spinner />}

        {/* Lineups */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4 mb-4">
          <h3 className="text-sm font-semibold text-black dark:text-white mb-3">Starting Lineup</h3>
          {!loading && !hasLineup ? (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Lineup data is not available on the free tier of football-data.org. Upgrade to Tier 2+ for lineup access.
            </p>
          ) : hasLineup ? (
            <div className="grid grid-cols-2 gap-4">
              {(['homeTeam', 'awayTeam'] as const).map((side) => {
                const team = detail![side] as any
                return (
                  <div key={side}>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      {side === 'homeTeam'
                        ? match.homeTeam.shortName
                        : match.awayTeam.shortName}
                    </p>
                    {(team.lineup || []).map((p: any) => (
                      <p key={p.id} className="text-xs text-black dark:text-white py-0.5">
                        {p.shirtNumber && (
                          <span className="text-gray-400 w-5 inline-block">{p.shirtNumber}</span>
                        )}
                        {p.name}
                      </p>
                    ))}
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>

        {/* Injuries */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4 mb-4">
          <h3 className="text-sm font-semibold text-black dark:text-white mb-2">Injuries</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Injury data is not available on the free tier of football-data.org.
          </p>
        </div>

        {/* B-team notice */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4">
          <h3 className="text-sm font-semibold text-black dark:text-white mb-2">Reserve Team</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            "B team" detection requires lineup data compared against a squad database — not available on the free tier. Upgrade to a paid tier for this feature.
          </p>
        </div>
      </div>
    </div>
  )
}

function GroupTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
        active
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300'
      }`}
    >
      {label}
    </button>
  )
}

function StandingsTable({ table }: { table: Standing[] }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden mb-4">
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-x-3 px-4 py-2 bg-gray-50 dark:bg-zinc-800/50 text-xs text-gray-400 dark:text-gray-500 font-medium">
        <span>#</span>
        <span>Team</span>
        <span>P</span>
        <span>W</span>
        <span>D</span>
        <span>Pts</span>
      </div>
      {table.map((row) => (
        <div
          key={row.team.id}
          className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-x-3 px-4 py-2.5 border-t border-gray-100 dark:border-zinc-800 items-center"
        >
          <span className="text-xs text-gray-500 w-4 text-center">{row.position}</span>
          <div className="flex items-center gap-2 min-w-0">
            {row.team.crest && (
              <img src={row.team.crest} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
            )}
            <span className="text-xs font-medium text-black dark:text-white truncate">
              {row.team.shortName || row.team.name}
            </span>
          </div>
          <span className="text-xs text-gray-500 text-center">{row.playedGames}</span>
          <span className="text-xs text-gray-500 text-center">{row.won}</span>
          <span className="text-xs text-gray-500 text-center">{row.draw}</span>
          <span className="text-xs font-bold text-black dark:text-white text-center">{row.points}</span>
        </div>
      ))}
    </div>
  )
}

interface WorldCupProps {
  initialMatch?: Match | null
  onNavigated?: () => void
}

export function WorldCup({ initialMatch, onNavigated }: WorldCupProps = {}) {
  const { matches, standings, loading, error, lastUpdated, refresh } = useMatches()
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL')
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(initialMatch ?? null)
  const { detail, loading: detailLoading } = useMatchDetail(selectedMatch?.id ?? null)

  // Signal parent that we've consumed the initial match
  if (initialMatch && onNavigated) {
    onNavigated()
  }

  if (selectedMatch) {
    return (
      <MatchDetailView
        match={selectedMatch}
        detail={detail}
        loading={detailLoading}
        onBack={() => setSelectedMatch(null)}
      />
    )
  }

  // Extract unique groups from matches
  const groups = ['ALL', ...Array.from(
    new Set(
      matches
        .filter((m) => m.group)
        .map((m) => m.group!)
        .sort()
    )
  )]

  const filtered = selectedGroup === 'ALL'
    ? matches
    : matches.filter((m) => m.group === selectedGroup)

  const currentStanding = standings.find((s) => s.group === selectedGroup)

  const subtitle = lastUpdated
    ? `Updated ${format(toZonedTime(lastUpdated, TZ), 'HH:mm')}`
    : undefined

  const groupLabel = (g: string) =>
    g === 'ALL' ? 'All' : g.replace('GROUP_', 'Group ')

  return (
    <div className="flex flex-col h-full">
      <Header
        title="World Cup 2026"
        subtitle={subtitle}
        right={
          <button onClick={refresh} className="text-blue-500 text-sm font-medium p-1">
            ↻
          </button>
        }
      />

      {/* Group selector */}
      {!loading && !error && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none bg-white/60 dark:bg-black/60 backdrop-blur-sm border-b border-gray-100 dark:border-zinc-800">
          {groups.map((g) => (
            <GroupTab
              key={g}
              label={groupLabel(g)}
              active={selectedGroup === g}
              onClick={() => setSelectedGroup(g)}
            />
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto scroll-smooth-ios pb-24">
        {loading && <Spinner />}

        {!loading && error && (
          <ErrorState
            message={error.includes('API key')
              ? 'Add your football-data.org API key in .env to see match data.'
              : error}
            onRetry={refresh}
          />
        )}

        {!loading && !error && matches.length === 0 && (
          <EmptyState message="No match data available. The 2026 World Cup may not be loaded yet in the API." />
        )}

        {!loading && !error && matches.length > 0 && (
          <div className="px-4 py-3 flex flex-col gap-2">
            {/* Group standings table */}
            {selectedGroup !== 'ALL' && currentStanding?.table?.length && (
              <StandingsTable table={currentStanding.table} />
            )}

            {/* Match list */}
            {filtered.map((match) => (
              <MatchCard key={match.id} match={match} onClick={setSelectedMatch} />
            ))}

            {filtered.length === 0 && (
              <EmptyState message="No matches in this group yet." />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
