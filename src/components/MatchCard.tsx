import { format, parseISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import type { Match } from '../types'

const TZ = 'Europe/Brussels'

interface Props {
  match: Match
  onClick: (match: Match) => void
  isFavorite?: boolean
  onToggleFavorite?: (teamId: number) => void
  compact?: boolean
}

export function MatchCard({ match, onClick, isFavorite = false, onToggleFavorite, compact = false }: Props) {
  const isLive     = match.status === 'IN_PLAY' || match.status === 'PAUSED'
  const isFinished = match.status === 'FINISHED'
  const showScore  = isLive || isFinished
  const time       = format(toZonedTime(parseISO(match.utcDate), TZ), 'HH:mm')

  const accentColor = isLive ? 'var(--c-green)' : isFinished ? 'var(--c-text4)' : 'var(--c-accent)'
  const liveBg      = 'rgba(48,209,88,0.06)'

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: isLive ? liveBg : 'var(--c-surface)',
        boxShadow: isLive
          ? '0 0 0 1px var(--c-green), 0 2px 12px rgba(48,209,88,0.15)'
          : '0 1px 4px var(--c-shadow), 0 0 0 0.5px var(--c-sep)',
      }}
    >
      <button
        onClick={() => onClick(match)}
        className="w-full text-left px-4 py-3 active:opacity-70 transition-opacity"
      >
        {/* Top meta row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {match.group && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(10,132,255,0.1)', color: 'var(--c-accent)' }}
              >
                {match.group.replace('GROUP_', 'Gr. ')}
              </span>
            )}
            {!match.group && match.stage && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(191,90,242,0.1)', color: 'var(--c-purple)' }}
              >
                {match.stage.replace(/_/g, ' ')}
              </span>
            )}
            {match.venue?.city && (
              <span className="text-[10px]" style={{ color: 'var(--c-text4)' }}>{match.venue.city}</span>
            )}
          </div>

          {isLive ? (
            <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: 'var(--c-green)' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--c-green)' }} />
              {match.status === 'PAUSED' ? 'RUST' : 'LIVE'}
            </span>
          ) : isFinished ? (
            <span className="text-[11px] font-semibold" style={{ color: 'var(--c-text4)' }}>Afgelopen</span>
          ) : (
            <span className="text-[12px] font-bold tabular-nums" style={{ color: 'var(--c-accent)' }}>{time}</span>
          )}
        </div>

        {/* Teams + score */}
        <div className="flex items-center gap-2">
          {/* Home */}
          <div className="flex-1 flex items-center justify-end gap-2">
            <span
              className="text-[14px] font-semibold truncate"
              style={{ color: isFinished ? 'var(--c-text3)' : 'var(--c-text)' }}
            >
              {match.homeTeam.shortName || match.homeTeam.name}
            </span>
            {match.homeTeam.crest
              ? <img src={match.homeTeam.crest} alt="" className="w-9 h-9 object-contain shrink-0" />
              : <span className="w-9 h-9 rounded-xl shrink-0" style={{ background: 'var(--c-surface2)' }} />
            }
          </div>

          {/* Score */}
          <div className="flex items-center gap-1 min-w-[60px] justify-center shrink-0">
            {showScore ? (
              <span
                className="text-[22px] font-black tabular-nums tracking-tight"
                style={{ color: isLive ? 'var(--c-green)' : 'var(--c-text)' }}
              >
                {match.score.fullTime.home ?? 0}–{match.score.fullTime.away ?? 0}
              </span>
            ) : (
              <span className="text-[13px] font-medium" style={{ color: 'var(--c-text4)' }}>vs</span>
            )}
          </div>

          {/* Away */}
          <div className="flex-1 flex items-center gap-2">
            {match.awayTeam.crest
              ? <img src={match.awayTeam.crest} alt="" className="w-9 h-9 object-contain shrink-0" />
              : <span className="w-9 h-9 rounded-xl shrink-0" style={{ background: 'var(--c-surface2)' }} />
            }
            <span
              className="text-[14px] font-semibold truncate"
              style={{ color: isFinished ? 'var(--c-text3)' : 'var(--c-text)' }}
            >
              {match.awayTeam.shortName || match.awayTeam.name}
            </span>
          </div>
        </div>
      </button>

      {/* Favorite buttons */}
      {onToggleFavorite && !compact && (
        <div className="flex" style={{ borderTop: '0.5px solid var(--c-sep)' }}>
          {[match.homeTeam, match.awayTeam].map((team) => (
            <button
              key={team.id}
              onClick={() => onToggleFavorite(team.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-medium active:opacity-50"
              style={{ color: isFavorite ? 'var(--c-yellow)' : 'var(--c-text4)' }}
            >
              {isFavorite ? '★' : '☆'} {team.shortName || team.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
