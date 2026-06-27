import { useState } from 'react'
import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { nl } from 'date-fns/locale'
import { RefreshCw, Star, List, GitBranch } from 'lucide-react'
import { Header } from '../components/Header'
import { MatchCard } from '../components/MatchCard'
import { Bracket } from '../components/Bracket'
import { EmptyState, ErrorState, Spinner } from '../components/Spinner'
import { useMatchDetail, useMatches } from '../hooks/useMatches'
import type { Match, MatchDetail, Player, Standing } from '../types'

const TZ = 'Europe/Brussels'

function formatLocal(utcDate: string, fmt: string) {
  return format(toZonedTime(parseISO(utcDate), TZ), fmt, { locale: nl })
}

function friendlyDate(utcDate: string): string {
  const zoned = toZonedTime(parseISO(utcDate), TZ)
  if (isToday(zoned))     return 'Vandaag'
  if (isTomorrow(zoned))  return 'Morgen'
  if (isYesterday(zoned)) return 'Gisteren'
  return format(zoned, 'EEEE d MMMM', { locale: nl })
}

// ── Match detail ───────────────────────────────────────────────────────────────
function MatchDetailView({ match, detail, loading, onBack, favoriteTeamIds, onToggleFavorite }: {
  match: Match; detail: MatchDetail | null; loading: boolean
  onBack: () => void; favoriteTeamIds: number[]; onToggleFavorite: (id: number) => void
}) {
  const isLive     = match.status === 'IN_PLAY' || match.status === 'PAUSED'
  const isFinished = match.status === 'FINISHED'
  const showScore  = isLive || isFinished
  const hasLineup  = !!(detail?.homeTeam as any)?.lineup?.length

  return (
    <div className="flex flex-col h-full">
      <Header
        title={`${match.homeTeam.tla} – ${match.awayTeam.tla}`}
        subtitle={`${formatLocal(match.utcDate, 'EEEE d MMM · HH:mm')}${match.venue ? ` · ${match.venue.name}, ${match.venue.city}` : ''}`}
        right={
          <button onClick={onBack} className="text-blue-500 font-semibold min-w-[44px] min-h-[44px] flex items-center justify-end pr-1">
            ← Terug
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto scroll-smooth-ios mb-nav px-4 py-4 space-y-4">

        {/* Score card */}
        <div className={`rounded-2xl border p-5 ${isLive ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' : 'bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800'}`}>
          <div className="flex items-center gap-4">
            {/* Home team */}
            <div className="flex flex-col items-center gap-2 flex-1">
              {match.homeTeam.crest && <img src={match.homeTeam.crest} alt="" className="w-14 h-14 object-contain" />}
              <span className="text-sm font-semibold text-black dark:text-white text-center">{match.homeTeam.shortName || match.homeTeam.name}</span>
              <button
                onClick={() => onToggleFavorite(match.homeTeam.id)}
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center gap-1 text-xs transition-colors ${favoriteTeamIds.includes(match.homeTeam.id) ? 'text-yellow-500' : 'text-gray-300 dark:text-zinc-600'}`}
              >
                <Star size={14} className={favoriteTeamIds.includes(match.homeTeam.id) ? 'fill-yellow-400' : ''} />
                {favoriteTeamIds.includes(match.homeTeam.id) ? 'Favoriet' : 'Voeg toe'}
              </button>
            </div>

            {/* Score */}
            <div className="text-center px-2 shrink-0">
              {showScore
                ? <span className={`text-4xl font-bold tracking-tight ${isLive ? 'text-green-500' : 'text-black dark:text-white'}`}>
                    {match.score.fullTime.home ?? 0}–{match.score.fullTime.away ?? 0}
                  </span>
                : <span className="text-xl text-gray-300 dark:text-zinc-600">vs</span>
              }
              <p className={`text-[10px] mt-1 font-medium ${isLive ? 'text-green-500' : 'text-gray-400'}`}>
                {isLive && match.status === 'PAUSED' ? '⏸ Rust' : isLive ? '● LIVE' : isFinished ? 'Afgelopen' : formatLocal(match.utcDate, 'HH:mm')}
              </p>
            </div>

            {/* Away team */}
            <div className="flex flex-col items-center gap-2 flex-1">
              {match.awayTeam.crest && <img src={match.awayTeam.crest} alt="" className="w-14 h-14 object-contain" />}
              <span className="text-sm font-semibold text-black dark:text-white text-center">{match.awayTeam.shortName || match.awayTeam.name}</span>
              <button
                onClick={() => onToggleFavorite(match.awayTeam.id)}
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center gap-1 text-xs transition-colors ${favoriteTeamIds.includes(match.awayTeam.id) ? 'text-yellow-500' : 'text-gray-300 dark:text-zinc-600'}`}
              >
                <Star size={14} className={favoriteTeamIds.includes(match.awayTeam.id) ? 'fill-yellow-400' : ''} />
                {favoriteTeamIds.includes(match.awayTeam.id) ? 'Favoriet' : 'Voeg toe'}
              </button>
            </div>
          </div>
        </div>

        {loading && <Spinner />}

        {/* Lineup */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4">
          <h3 className="text-sm font-semibold text-black dark:text-white mb-3">Opstelling</h3>
          {!loading && !hasLineup
            ? <p className="text-xs text-gray-400 dark:text-zinc-500">Opstellingsdata niet beschikbaar op de gratis tier van football-data.org.</p>
            : hasLineup && (
              <div className="grid grid-cols-2 gap-4">
                {(['homeTeam', 'awayTeam'] as const).map((side) => {
                  const team = (detail as any)[side]
                  return (
                    <div key={side}>
                      <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-2">
                        {side === 'homeTeam' ? match.homeTeam.shortName : match.awayTeam.shortName}
                      </p>
                      {(team?.lineup ?? []).map((p: Player) => (
                        <p key={p.id} className="text-xs text-black dark:text-white py-0.5 flex gap-2">
                          {p.shirtNumber && <span className="text-gray-400 w-4 shrink-0">{p.shirtNumber}</span>}
                          {p.name}
                        </p>
                      ))}
                    </div>
                  )
                })}
              </div>
            )
          }
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4">
          <h3 className="text-sm font-semibold text-black dark:text-white mb-2">Blessures & B-ploeg</h3>
          <p className="text-xs text-gray-400 dark:text-zinc-500">Niet beschikbaar op de gratis tier van football-data.org.</p>
        </div>
      </div>
    </div>
  )
}

// ── Standings table ────────────────────────────────────────────────────────────
function StandingsTable({ table, favoriteTeamIds }: { table: Standing[]; favoriteTeamIds: number[] }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden mb-3">
      <div className="grid grid-cols-[20px_1fr_28px_28px_28px_32px] gap-x-2 px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 text-[10px] text-gray-400 dark:text-zinc-500 font-semibold uppercase tracking-wide">
        <span>#</span><span>Team</span><span className="text-center">S</span><span className="text-center">W</span><span className="text-center">G</span><span className="text-center">Pts</span>
      </div>
      {table.map((row, i) => (
        <div key={row.team.id} className={`grid grid-cols-[20px_1fr_28px_28px_28px_32px] gap-x-2 px-3 py-2.5 border-t border-gray-100 dark:border-zinc-800 items-center ${favoriteTeamIds.includes(row.team.id) ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''}`}>
          <span className={`text-xs font-bold text-center ${i < 2 ? 'text-green-500' : 'text-gray-400 dark:text-zinc-500'}`}>{row.position}</span>
          <div className="flex items-center gap-1.5 min-w-0">
            {row.team.crest && <img src={row.team.crest} alt="" className="w-5 h-5 object-contain shrink-0" />}
            <span className="text-xs font-medium text-black dark:text-white truncate">{row.team.shortName || row.team.name}</span>
            {favoriteTeamIds.includes(row.team.id) && <Star size={10} className="fill-yellow-400 text-yellow-400 shrink-0" />}
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

// ── Main page ──────────────────────────────────────────────────────────────────
const FILTER_OPTIONS = ['Alles', 'Vandaag', 'Live', 'Gespeeld', 'Gepland'] as const
type FilterOption = (typeof FILTER_OPTIONS)[number]
type View = 'wedstrijden' | 'speelschema'

interface Props {
  favoriteTeamIds: number[]
  onToggleFavorite: (teamId: number) => void
  initialMatch?: Match | null
  onNavigated?: () => void
}

export function WorldCup({ favoriteTeamIds, onToggleFavorite, initialMatch, onNavigated }: Props) {
  const { matches, standings, loading, error, lastUpdated, refresh } = useMatches()
  const [view, setView] = useState<View>('wedstrijden')
  const [selectedGroup, setSelectedGroup] = useState<string>('Alles')
  const [filterOption, setFilterOption] = useState<FilterOption>('Alles')
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(initialMatch ?? null)
  const { detail, loading: detailLoading } = useMatchDetail(selectedMatch?.id ?? null)

  if (initialMatch && onNavigated) onNavigated()

  if (selectedMatch) {
    return (
      <MatchDetailView
        match={selectedMatch}
        detail={detail}
        loading={detailLoading}
        onBack={() => setSelectedMatch(null)}
        favoriteTeamIds={favoriteTeamIds}
        onToggleFavorite={onToggleFavorite}
      />
    )
  }

  const groups = ['Alles', ...Array.from(
    new Set(matches.filter((m) => m.group).map((m) => m.group!).sort())
  ).map((g) => g.replace('GROUP_', 'G'))]

  let filtered = selectedGroup === 'Alles'
    ? matches.filter((m) => m.group) // only group stage in list view
    : matches.filter((m) => m.group === selectedGroup.replace('G', 'GROUP_'))

  if (filterOption === 'Live')     filtered = filtered.filter((m) => m.status === 'IN_PLAY' || m.status === 'PAUSED')
  else if (filterOption === 'Gespeeld') filtered = filtered.filter((m) => m.status === 'FINISHED')
  else if (filterOption === 'Gepland')  filtered = filtered.filter((m) => m.status === 'SCHEDULED' || m.status === 'TIMED')
  else if (filterOption === 'Vandaag')  filtered = filtered.filter((m) => isToday(toZonedTime(parseISO(m.utcDate), TZ)))

  const byDate = filtered.reduce<Record<string, Match[]>>((acc, m) => {
    const key = m.utcDate.split('T')[0];
    (acc[key] = acc[key] ?? []).push(m)
    return acc
  }, {})
  const sortedDates = Object.keys(byDate).sort()

  const subtitle = lastUpdated ? `Updated ${format(lastUpdated, 'HH:mm')}` : undefined

  return (
    <div className="flex flex-col h-full">
      <Header
        title="WK 2026"
        subtitle={subtitle}
        right={
          <button onClick={refresh} className="text-blue-500 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <RefreshCw size={18} />
          </button>
        }
      />

      {/* View toggle: Wedstrijden | Speelschema */}
      <div className="flex bg-white dark:bg-black border-b border-gray-100 dark:border-zinc-800">
        {([['wedstrijden', <List size={14} />, 'Wedstrijden'], ['speelschema', <GitBranch size={14} />, 'Speelschema']] as const).map(([v, icon, label]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors border-b-2 ${
              view === v
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-400 dark:text-zinc-500'
            }`}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Filters (only in wedstrijden view) */}
      {view === 'wedstrijden' && !loading && !error && (
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-100 dark:border-zinc-800">
          <div className="flex gap-2 px-4 pt-2 pb-1 overflow-x-auto scrollbar-none">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilterOption(opt)}
                className={`px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap min-h-[36px] transition-colors ${
                  filterOption === opt
                    ? opt === 'Live' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                {opt === 'Live' ? '● Live' : opt}
              </button>
            ))}
          </div>
          {groups.length > 1 && (
            <div className="flex gap-2 px-4 pb-2 overflow-x-auto scrollbar-none">
              {groups.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGroup(g)}
                  className={`px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap min-h-[36px] transition-colors ${
                    selectedGroup === g
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto scroll-smooth-ios mb-nav">
        {loading && <Spinner />}
        {!loading && error && <ErrorState message={error} onRetry={refresh} />}
        {!loading && !error && matches.length === 0 && (
          <EmptyState message="Geen wedstrijddata beschikbaar." />
        )}

        {/* Speelschema / Bracket view */}
        {!loading && !error && view === 'speelschema' && (
          <Bracket matches={matches} onClick={setSelectedMatch} />
        )}

        {/* Wedstrijden list view */}
        {!loading && !error && view === 'wedstrijden' && matches.length > 0 && (
          <div className="px-4 py-3 space-y-5">
            {selectedGroup !== 'Alles' && (() => {
              const fullGroup = selectedGroup.replace('G', 'GROUP_')
              const standing = standings.find((s) => s.group === fullGroup && s.type === 'TOTAL')
              return standing?.table?.length
                ? <div>
                    <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wide mb-2">
                      Stand – Poule {selectedGroup.replace('G', '')}
                    </p>
                    <StandingsTable table={standing.table} favoriteTeamIds={favoriteTeamIds} />
                  </div>
                : null
            })()}

            {sortedDates.length === 0
              ? <EmptyState message="Geen wedstrijden voor deze filter." />
              : sortedDates.map((dateKey) => (
                <div key={dateKey}>
                  <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wide mb-2 capitalize">
                    {friendlyDate(byDate[dateKey][0].utcDate)}
                  </p>
                  <div className="space-y-2">
                    {byDate[dateKey].map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        onClick={setSelectedMatch}
                        isFavorite={favoriteTeamIds.includes(match.homeTeam.id) || favoriteTeamIds.includes(match.awayTeam.id)}
                        onToggleFavorite={onToggleFavorite}
                      />
                    ))}
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  )
}
