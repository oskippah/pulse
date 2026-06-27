import type { Match } from '../types'
import { format, parseISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const TZ = 'Europe/Brussels'

interface Props {
  match: Match
  onClick: (match: Match) => void
}

function formatLocal(utcDate: string) {
  const zoned = toZonedTime(parseISO(utcDate), TZ)
  return format(zoned, 'dd MMM · HH:mm')
}

function StatusBadge({ status }: { status: Match['status'] }) {
  if (status === 'IN_PLAY')
    return <span className="text-xs font-bold text-red-500 animate-pulse">LIVE</span>
  if (status === 'PAUSED')
    return <span className="text-xs font-bold text-yellow-500">HT</span>
  if (status === 'FINISHED')
    return <span className="text-xs text-gray-400 dark:text-gray-500">FT</span>
  return null
}

export function MatchCard({ match, onClick }: Props) {
  const finished = match.status === 'FINISHED'
  const live = match.status === 'IN_PLAY' || match.status === 'PAUSED'
  const showScore = finished || live

  return (
    <button
      onClick={() => onClick(match)}
      className="w-full text-left bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors active:scale-[0.98] transform"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {formatLocal(match.utcDate)}
        </span>
        <StatusBadge status={match.status} />
      </div>

      <div className="flex items-center gap-3">
        {/* Home team */}
        <div className="flex-1 flex items-center gap-2 justify-end">
          <span className={`text-sm font-semibold truncate ${finished || live ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
            {match.homeTeam.shortName || match.homeTeam.name}
          </span>
          {match.homeTeam.crest && (
            <img src={match.homeTeam.crest} alt="" className="w-7 h-7 object-contain" />
          )}
        </div>

        {/* Score or VS */}
        <div className="flex items-center gap-1.5 min-w-[60px] justify-center">
          {showScore ? (
            <>
              <span className="text-lg font-bold text-black dark:text-white w-5 text-center">
                {match.score.fullTime.home ?? '–'}
              </span>
              <span className="text-gray-400 text-sm">:</span>
              <span className="text-lg font-bold text-black dark:text-white w-5 text-center">
                {match.score.fullTime.away ?? '–'}
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-400 font-medium">vs</span>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1 flex items-center gap-2">
          {match.awayTeam.crest && (
            <img src={match.awayTeam.crest} alt="" className="w-7 h-7 object-contain" />
          )}
          <span className={`text-sm font-semibold truncate ${finished || live ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
            {match.awayTeam.shortName || match.awayTeam.name}
          </span>
        </div>
      </div>
    </button>
  )
}
