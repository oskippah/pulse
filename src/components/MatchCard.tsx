import { format, parseISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import type { Match } from '../types'

const TZ = 'Europe/Brussels'

function formatLocal(utcDate: string) {
  return format(toZonedTime(parseISO(utcDate), TZ), 'HH:mm')
}

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

  const accentColor = isLive ? 'var(--c-green)' : isFinished ? 'var(--c-text4)' : 'var(--c-accent)'

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--c-surface)',
        boxShadow: '0 1px 3px var(--c-shadow)',
        borderLeft: `4px solid ${accentColor}`,
      }}
    >
      <button
        onClick={() => onClick(match)}
        className="w-full text-left px-4 py-3.5 active:opacity-70 transition-opacity"
      >
        {/* Top row */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {match.group && (
              <span
                className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(10,132,255,0.12)', color: 'var(--c-accent)' }}
              >
                {match.group.replace('GROUP_', 'Gr. ')}
              </span>
            )}
            {!match.group && match.stage && (
              <span
                className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(175,82,222,0.12)', color: 'var(--c-purple)' }}
              >
                {match.stage.replace(/_/g, ' ')}
              </span>
            )}
            {match.venue?.city && (
              <span className="text-[10px]" style={{ color: 'var(--c-text4)' }}>
                {match.venue.city}
              </span>
            )}
          </div>

          {isLive ? (
            <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: 'var(--c-green)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--c-green)' }} />
              {match.status === 'PAUSED' ? 'RUST' : 'LIVE'}
            </span>
          ) : isFinished ? (
            <span className="text-[11px] font-semibold" style={{ color: 'var(--c-text4)' }}>FT</span>
          ) : (
            <span className="text-[12px] font-semibold" style={{ color: 'var(--c-accent)' }}>
              {formatLocal(match.utcDate)}
            </span>
          )}
        </div>

        {/* Teams + score */}
        <div className="flex items-center gap-3">
          {/* Home */}
          <div className="flex-1 flex items-center gap-2 justify-end">
            <span
              className="text-[14px] font-semibold truncate"
              style={{ color: isFinished ? 'var(--c-text3)' : 'var(--c-text)' }}
            >
              {match.homeTeam.shortName || match.homeTeam.name}
            </span>
            {match.homeTeam.crest
              ? <img src={match.homeTeam.crest} alt="" className="w-8 h-8 object-contain shrink-0" />
              : <span className="w-8 h-8 rounded-full shrink-0" style={{ background: 'var(--c-surface2)' }} />
            }
          </div>

          {/* Score / vs */}
          <div className="flex items-center gap-1 min-w-[52px] justify-center shrink-0">
            {showScore ? (
              <>
                <span
                  className="text-[18px] font-bold w-6 text-center tabular-nums"
                  style={{ color: isLive ? 'var(--c-green)' : 'var(--c-text)' }}
                >
                  {match.score.fullTime.home ?? 0}
                </span>
                <span style={{ color: 'var(--c-text4)' }} className="text-sm">–</span>
                <span
                  className="text-[18px] font-bold w-6 text-center tabular-nums"
                  style={{ color: isLive ? 'var(--c-green)' : 'var(--c-text)' }}
                >
                  {match.score.fullTime.away ?? 0}
                </span>
              </>
            ) : (
              <span className="text-sm" style={{ color: 'var(--c-text4)' }}>–</span>
            )}
          </div>

          {/* Away */}
          <div className="flex-1 flex items-center gap-2">
            {match.awayTeam.crest
              ? <img src={match.awayTeam.crest} alt="" className="w-8 h-8 object-contain shrink-0" />
              : <span className="w-8 h-8 rounded-full shrink-0" style={{ background: 'var(--c-surface2)' }} />
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
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-medium transition-opacity active:opacity-50"
              style={{ color: isFavorite ? 'var(--c-yellow)' : 'var(--c-text4)' }}
            >
              <span>{isFavorite ? '★' : '☆'}</span>
              <span>{team.shortName || team.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
