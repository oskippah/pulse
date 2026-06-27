import { Star } from 'lucide-react'
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

function formatLocal(utcDate: string) {
  return format(toZonedTime(parseISO(utcDate), TZ), 'HH:mm')
}

function groupLabel(group: string | null) {
  if (!group) return null
  return group.replace('GROUP_', 'Group ')
}

export function MatchCard({ match, onClick, isFavorite = false, onToggleFavorite, compact = false }: Props) {
  const isLive    = match.status === 'IN_PLAY' || match.status === 'PAUSED'
  const isFinished = match.status === 'FINISHED'
  const showScore  = isLive || isFinished

  // Border color based on status
  const borderClass = isLive
    ? 'border-l-4 border-l-green-500'
    : isFinished
    ? 'border-l-4 border-l-gray-300 dark:border-l-zinc-700'
    : 'border-l-4 border-l-blue-400'

  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden ${borderClass}`}>
      <button
        onClick={() => onClick(match)}
        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-colors active:scale-[0.99] transform"
      >
        {/* Top row: group + time + status */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            {match.group && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                {groupLabel(match.group)}
              </span>
            )}
            {match.stage && !match.group && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                {match.stage.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="flex items-center gap-1 text-xs font-bold text-green-500">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {match.status === 'PAUSED' ? 'HT' : 'LIVE'}
              </span>
            ) : isFinished ? (
              <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium">FT</span>
            ) : (
              <span className="text-xs font-semibold text-blue-500">{formatLocal(match.utcDate)}</span>
            )}
          </div>
        </div>

        {/* Teams + score */}
        <div className="flex items-center gap-2">
          {/* Home team */}
          <div className="flex-1 flex items-center gap-2 justify-end">
            <span className={`text-sm font-semibold truncate ${isFinished ? 'text-gray-500 dark:text-zinc-400' : 'text-black dark:text-white'}`}>
              {match.homeTeam.shortName || match.homeTeam.name}
            </span>
            {match.homeTeam.crest ? (
              <img src={match.homeTeam.crest} alt="" className="w-8 h-8 object-contain flex-shrink-0" />
            ) : (
              <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex-shrink-0" />
            )}
          </div>

          {/* Score / vs */}
          <div className="flex items-center gap-1 min-w-[56px] justify-center">
            {showScore ? (
              <>
                <span className={`text-xl font-bold w-6 text-center ${isLive ? 'text-green-500' : 'text-black dark:text-white'}`}>
                  {match.score.fullTime.home ?? 0}
                </span>
                <span className="text-gray-300 dark:text-zinc-600 font-light">–</span>
                <span className={`text-xl font-bold w-6 text-center ${isLive ? 'text-green-500' : 'text-black dark:text-white'}`}>
                  {match.score.fullTime.away ?? 0}
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-300 dark:text-zinc-600 font-light">–</span>
            )}
          </div>

          {/* Away team */}
          <div className="flex-1 flex items-center gap-2">
            {match.awayTeam.crest ? (
              <img src={match.awayTeam.crest} alt="" className="w-8 h-8 object-contain flex-shrink-0" />
            ) : (
              <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex-shrink-0" />
            )}
            <span className={`text-sm font-semibold truncate ${isFinished ? 'text-gray-500 dark:text-zinc-400' : 'text-black dark:text-white'}`}>
              {match.awayTeam.shortName || match.awayTeam.name}
            </span>
          </div>
        </div>
      </button>

      {/* Favorite buttons */}
      {onToggleFavorite && !compact && (
        <div className="flex border-t border-gray-100 dark:border-zinc-800">
          {[match.homeTeam, match.awayTeam].map((team) => (
            <button
              key={team.id}
              onClick={() => onToggleFavorite(team.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-gray-400 dark:text-zinc-500 hover:text-yellow-500 transition-colors"
            >
              <Star
                size={13}
                className={isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}
              />
              <span>{team.shortName || team.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
