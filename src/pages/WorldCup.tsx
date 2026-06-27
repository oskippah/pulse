import { useState } from 'react'
import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { nl } from 'date-fns/locale'
import { RefreshCw, List, GitBranch } from 'lucide-react'
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
        subtitle={`${formatLocal(match.utcDate, 'EEEE d MMM · HH:mm')}${match.venue ? ` · ${match.venue.city}` : ''}`}
        right={
          <button
            onClick={onBack}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center font-semibold text-[15px]"
            style={{ color: 'var(--c-accent)' }}
          >
            ← Terug
          </button>
        }
      />
      <div className="flex-1 scroll-ios mb-nav px-4 py-4 space-y-3">

        {/* Score card */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: isLive ? 'rgba(48,209,88,0.08)' : 'var(--c-surface)',
            border: `1px solid ${isLive ? 'var(--c-green)' : 'var(--c-sep)'}`,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-2 flex-1">
              {match.homeTeam.crest && <img src={match.homeTeam.crest} alt="" className="w-16 h-16 object-contain" />}
              <span className="text-[14px] font-semibold text-center" style={{ color: 'var(--c-text)' }}>
                {match.homeTeam.shortName || match.homeTeam.name}
              </span>
              <button
                onClick={() => onToggleFavorite(match.homeTeam.id)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center gap-1 text-[12px]"
                style={{ color: favoriteTeamIds.includes(match.homeTeam.id) ? 'var(--c-yellow)' : 'var(--c-text4)' }}
              >
                <span>{favoriteTeamIds.includes(match.homeTeam.id) ? '★' : '☆'}</span>
                {favoriteTeamIds.includes(match.homeTeam.id) ? 'Favoriet' : 'Volgen'}
              </button>
            </div>

            <div className="text-center px-2 shrink-0">
              {showScore
                ? <span className="text-4xl font-bold tabular-nums" style={{ color: isLive ? 'var(--c-green)' : 'var(--c-text)' }}>
                    {match.score.fullTime.home ?? 0}–{match.score.fullTime.away ?? 0}
                  </span>
                : <span className="text-2xl" style={{ color: 'var(--c-text4)' }}>vs</span>
              }
              <p className="text-[11px] mt-1 font-semibold" style={{ color: isLive ? 'var(--c-green)' : 'var(--c-text3)' }}>
                {isLive && match.status === 'PAUSED' ? '⏸ Rust'
                  : isLive ? '● LIVE'
                  : isFinished ? 'Afgelopen'
                  : formatLocal(match.utcDate, 'HH:mm')}
              </p>
            </div>

            <div className="flex flex-col items-center gap-2 flex-1">
              {match.awayTeam.crest && <img src={match.awayTeam.crest} alt="" className="w-16 h-16 object-contain" />}
              <span className="text-[14px] font-semibold text-center" style={{ color: 'var(--c-text)' }}>
                {match.awayTeam.shortName || match.awayTeam.name}
              </span>
              <button
                onClick={() => onToggleFavorite(match.awayTeam.id)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center gap-1 text-[12px]"
                style={{ color: favoriteTeamIds.includes(match.awayTeam.id) ? 'var(--c-yellow)' : 'var(--c-text4)' }}
              >
                <span>{favoriteTeamIds.includes(match.awayTeam.id) ? '★' : '☆'}</span>
                {favoriteTeamIds.includes(match.awayTeam.id) ? 'Favoriet' : 'Volgen'}
              </button>
            </div>
          </div>
        </div>

        {loading && <Spinner />}

        {/* Opstelling */}
        <div className="rounded-2xl p-4" style={{ background: 'var(--c-surface)' }}>
          <h3 className="text-[15px] font-semibold mb-3" style={{ color: 'var(--c-text)' }}>Opstelling</h3>
          {!loading && !hasLineup
            ? <p className="text-[13px]" style={{ color: 'var(--c-text3)' }}>
                Opstellingen zijn niet beschikbaar op de gratis API-tier.
              </p>
            : hasLineup && (
              <div className="grid grid-cols-2 gap-4">
                {(['homeTeam', 'awayTeam'] as const).map((side) => {
                  const team = (detail as any)[side]
                  return (
                    <div key={side}>
                      <p className="text-[12px] font-semibold mb-2" style={{ color: 'var(--c-text3)' }}>
                        {side === 'homeTeam' ? match.homeTeam.shortName : match.awayTeam.shortName}
                      </p>
                      {(team?.lineup ?? []).map((p: Player) => (
                        <div key={p.id} className="flex gap-2 py-0.5">
                          {p.shirtNumber && <span className="text-[12px] w-4 shrink-0" style={{ color: 'var(--c-text4)' }}>{p.shirtNumber}</span>}
                          <span className="text-[12px]" style={{ color: 'var(--c-text)' }}>{p.name}</span>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}

// ── Standings ──────────────────────────────────────────────────────────────────
function StandingsTable({ table, favoriteTeamIds }: { table: Standing[]; favoriteTeamIds: number[] }) {
  return (
    <div className="rounded-2xl overflow-hidden mb-3" style={{ background: 'var(--c-surface)', border: '0.5px solid var(--c-sep)' }}>
      <div
        className="grid grid-cols-[20px_1fr_28px_28px_28px_32px] gap-x-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide"
        style={{ background: 'var(--c-surface2)', color: 'var(--c-text3)' }}
      >
        <span>#</span><span>Team</span>
        <span className="text-center">S</span><span className="text-center">W</span>
        <span className="text-center">G</span><span className="text-center">Pts</span>
      </div>
      {table.map((row, i) => (
        <div
          key={row.team.id}
          className="grid grid-cols-[20px_1fr_28px_28px_28px_32px] gap-x-2 px-3 py-2.5 items-center"
          style={{
            borderTop: '0.5px solid var(--c-sep)',
            background: favoriteTeamIds.includes(row.team.id) ? 'rgba(255,204,0,0.06)' : 'transparent',
          }}
        >
          <span
            className="text-[11px] font-bold text-center"
            style={{ color: i < 2 ? 'var(--c-green)' : 'var(--c-text4)' }}
          >
            {row.position}
          </span>
          <div className="flex items-center gap-1.5 min-w-0">
            {row.team.crest && <img src={row.team.crest} alt="" className="w-5 h-5 object-contain shrink-0" />}
            <span className="text-[12px] font-medium truncate" style={{ color: 'var(--c-text)' }}>
              {row.team.shortName || row.team.name}
            </span>
            {favoriteTeamIds.includes(row.team.id) && <span className="text-[10px]" style={{ color: 'var(--c-yellow)' }}>★</span>}
          </div>
          <span className="text-[12px] text-center" style={{ color: 'var(--c-text3)' }}>{row.playedGames}</span>
          <span className="text-[12px] text-center" style={{ color: 'var(--c-text3)' }}>{row.won}</span>
          <span className="text-[12px] text-center" style={{ color: 'var(--c-text3)' }}>{row.draw}</span>
          <span className="text-[13px] font-bold text-center" style={{ color: 'var(--c-text)' }}>{row.points}</span>
        </div>
      ))}
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
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
    ? matches.filter((m) => m.group)
    : matches.filter((m) => m.group === selectedGroup.replace('G', 'GROUP_'))

  if (filterOption === 'Live')          filtered = filtered.filter((m) => m.status === 'IN_PLAY' || m.status === 'PAUSED')
  else if (filterOption === 'Gespeeld') filtered = filtered.filter((m) => m.status === 'FINISHED')
  else if (filterOption === 'Gepland')  filtered = filtered.filter((m) => m.status === 'SCHEDULED' || m.status === 'TIMED')
  else if (filterOption === 'Vandaag')  filtered = filtered.filter((m) => isToday(toZonedTime(parseISO(m.utcDate), TZ)))

  const byDate = filtered.reduce<Record<string, Match[]>>((acc, m) => {
    const key = m.utcDate.split('T')[0];
    (acc[key] = acc[key] ?? []).push(m)
    return acc
  }, {})
  const sortedDates = Object.keys(byDate).sort()

  const subtitle = lastUpdated ? `Bijgewerkt ${format(lastUpdated, 'HH:mm')}` : undefined

  return (
    <div className="flex flex-col h-full">
      <Header
        title="WK 2026"
        subtitle={subtitle}
        right={
          <button
            onClick={refresh}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center"
            style={{ color: 'var(--c-accent)' }}
          >
            <RefreshCw size={20} />
          </button>
        }
      />

      {/* View toggle */}
      <div
        className="flex"
        style={{ background: 'var(--c-surface)', borderBottom: '0.5px solid var(--c-sep)' }}
      >
        {([
          ['wedstrijden', <List size={15} key="l" />, 'Wedstrijden'],
          ['speelschema', <GitBranch size={15} key="b" />, 'Speelschema'],
        ] as const).map(([v, icon, label]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold transition-colors"
            style={{
              color: view === v ? 'var(--c-accent)' : 'var(--c-text3)',
              borderBottom: view === v ? '2px solid var(--c-accent)' : '2px solid transparent',
            }}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Filters */}
      {view === 'wedstrijden' && !loading && !error && (
        <div style={{ background: 'var(--c-surface)', borderBottom: '0.5px solid var(--c-sep)' }}>
          <div className="flex gap-2 px-4 pt-2 pb-1 overflow-x-auto scrollbar-none">
            {FILTER_OPTIONS.map((opt) => {
              const isActive = filterOption === opt
              const isLiveOpt = opt === 'Live'
              return (
                <button
                  key={opt}
                  onClick={() => setFilterOption(opt)}
                  className="px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap min-h-[34px] shrink-0"
                  style={{
                    background: isActive ? (isLiveOpt ? 'var(--c-green)' : 'var(--c-accent)') : 'var(--c-surface2)',
                    color: isActive ? '#fff' : 'var(--c-text2)',
                    border: `1px solid ${isActive ? 'transparent' : 'var(--c-sep)'}`,
                  }}
                >
                  {isLiveOpt ? '● Live' : opt}
                </button>
              )
            })}
          </div>
          {groups.length > 1 && (
            <div className="flex gap-2 px-4 pb-2 overflow-x-auto scrollbar-none">
              {groups.map((g) => {
                const isActive = selectedGroup === g
                return (
                  <button
                    key={g}
                    onClick={() => setSelectedGroup(g)}
                    className="px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap min-h-[34px] shrink-0"
                    style={{
                      background: isActive ? 'var(--c-purple)' : 'var(--c-surface2)',
                      color: isActive ? '#fff' : 'var(--c-text2)',
                      border: `1px solid ${isActive ? 'transparent' : 'var(--c-sep)'}`,
                    }}
                  >
                    {g}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 scroll-ios mb-nav">
        {loading && <Spinner />}
        {!loading && error && <ErrorState message={error} onRetry={refresh} />}
        {!loading && !error && matches.length === 0 && (
          <EmptyState icon="⚽" message="Geen wedstrijddata beschikbaar." />
        )}

        {!loading && !error && view === 'speelschema' && (
          <Bracket matches={matches} onClick={setSelectedMatch} />
        )}

        {!loading && !error && view === 'wedstrijden' && matches.length > 0 && (
          <div className="px-4 py-3 space-y-5">
            {selectedGroup !== 'Alles' && (() => {
              const fullGroup = selectedGroup.replace('G', 'GROUP_')
              const standing = standings.find((s) => s.group === fullGroup && s.type === 'TOTAL')
              return standing?.table?.length
                ? <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--c-text3)' }}>
                      Stand – Poule {selectedGroup.replace('G', '')}
                    </p>
                    <StandingsTable table={standing.table} favoriteTeamIds={favoriteTeamIds} />
                  </div>
                : null
            })()}

            {sortedDates.length === 0
              ? <EmptyState icon="📅" message="Geen wedstrijden voor deze filter." />
              : sortedDates.map((dateKey) => (
                <div key={dateKey}>
                  <p className="text-[11px] font-bold uppercase tracking-wide mb-2 capitalize" style={{ color: 'var(--c-text3)' }}>
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
