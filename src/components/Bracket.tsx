import { format, parseISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import type { Match } from '../types'

const TZ = 'Europe/Brussels'

const STAGE_ORDER = [
  'ROUND_OF_32',
  'ROUND_OF_16',
  'QUARTER_FINAL',
  'SEMI_FINAL',
  'FINAL',
]

const STAGE_LABEL: Record<string, string> = {
  ROUND_OF_32:   'Ronde van 32',
  ROUND_OF_16:   'Ronde van 16',
  QUARTER_FINAL: 'Kwartfinale',
  SEMI_FINAL:    'Halve finale',
  THIRD_PLACE:   '3e plaats',
  FINAL:         'Finale',
}

function formatTime(utcDate: string) {
  return format(toZonedTime(parseISO(utcDate), TZ), 'dd MMM · HH:mm')
}

interface BracketMatchProps {
  match: Match
  onClick: (m: Match) => void
  isLast?: boolean
}

function BracketMatch({ match, onClick, isLast }: BracketMatchProps) {
  const isLive     = match.status === 'IN_PLAY' || match.status === 'PAUSED'
  const isFinished = match.status === 'FINISHED'
  const showScore  = isLive || isFinished
  const isTBD      = !match.homeTeam?.name || match.homeTeam.name === 'TBD'

  const borderColor = isLive ? 'border-l-green-500' : isFinished ? 'border-l-gray-300 dark:border-l-zinc-700' : 'border-l-blue-400'

  return (
    <div className="relative flex items-stretch">
      {/* Match card */}
      <button
        onClick={() => onClick(match)}
        className={`w-44 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 border-l-4 ${borderColor} rounded-xl p-2.5 text-left flex flex-col gap-1.5 shadow-sm active:scale-95 transition-transform`}
      >
        {/* Date */}
        <span className="text-[9px] text-gray-400 dark:text-zinc-500 font-medium">
          {formatTime(match.utcDate)}
        </span>

        {/* Home */}
        <div className="flex items-center gap-1.5">
          {match.homeTeam?.crest
            ? <img src={match.homeTeam.crest} className="w-5 h-5 object-contain shrink-0" alt="" />
            : <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-zinc-800 shrink-0" />
          }
          <span className={`text-xs font-semibold truncate flex-1 ${isFinished ? 'text-gray-500 dark:text-zinc-400' : 'text-black dark:text-white'}`}>
            {isTBD ? 'TBD' : (match.homeTeam?.shortName || match.homeTeam?.name || 'TBD')}
          </span>
          {showScore && (
            <span className={`text-sm font-bold w-4 text-right ${isLive ? 'text-green-500' : 'text-black dark:text-white'}`}>
              {match.score.fullTime.home ?? 0}
            </span>
          )}
        </div>

        {/* Away */}
        <div className="flex items-center gap-1.5">
          {match.awayTeam?.crest
            ? <img src={match.awayTeam.crest} className="w-5 h-5 object-contain shrink-0" alt="" />
            : <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-zinc-800 shrink-0" />
          }
          <span className={`text-xs font-semibold truncate flex-1 ${isFinished ? 'text-gray-500 dark:text-zinc-400' : 'text-black dark:text-white'}`}>
            {isTBD ? 'TBD' : (match.awayTeam?.shortName || match.awayTeam?.name || 'TBD')}
          </span>
          {showScore && (
            <span className={`text-sm font-bold w-4 text-right ${isLive ? 'text-green-500' : 'text-black dark:text-white'}`}>
              {match.score.fullTime.away ?? 0}
            </span>
          )}
        </div>

        {/* Status */}
        {isLive && (
          <span className="text-[9px] font-bold text-green-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            LIVE
          </span>
        )}
        {isFinished && (
          <span className="text-[9px] text-gray-400 font-medium">Afgelopen</span>
        )}
      </button>

      {/* Connector line to next round */}
      {!isLast && (
        <div className="flex items-center">
          <div className="w-4 h-px bg-gray-200 dark:bg-zinc-700" />
        </div>
      )}
    </div>
  )
}

interface RoundColumnProps {
  stage: string
  matches: Match[]
  onClick: (m: Match) => void
  pairSize: number // vertical space per match pair
}

function RoundColumn({ stage, matches, onClick, pairSize }: RoundColumnProps) {
  return (
    <div className="flex flex-col shrink-0" style={{ gap: 0 }}>
      {/* Round label */}
      <div className="h-8 flex items-center justify-center mb-3">
        <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest whitespace-nowrap">
          {STAGE_LABEL[stage] ?? stage.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Matches with bracket connectors */}
      <div className="flex flex-col" style={{ gap: `${pairSize - 88}px` }}>
        {matches.map((match, i) => (
          <div key={match.id} className="relative flex items-center">
            {/* Vertical bracket connector (pairs every 2 matches) */}
            {i % 2 === 0 && matches[i + 1] && (
              <div
                className="absolute right-0 border-r-2 border-t-2 border-b-2 border-gray-200 dark:border-zinc-700 rounded-r-md pointer-events-none"
                style={{
                  top: '44px',
                  height: `${pairSize - 44}px`,
                  width: '16px',
                  right: '-16px',
                }}
              />
            )}
            <BracketMatch match={match} onClick={onClick} />
          </div>
        ))}
      </div>
    </div>
  )
}

interface Props {
  matches: Match[]
  onClick: (m: Match) => void
}

export function Bracket({ matches, onClick }: Props) {
  // Only knockout matches
  const knockout = matches.filter(
    (m) => STAGE_ORDER.includes(m.stage) || m.stage === 'THIRD_PLACE',
  )

  // Group by stage, in order
  const stages = STAGE_ORDER.filter((s) =>
    knockout.some((m) => m.stage === s),
  )

  // Third place playoff
  const thirdPlace = knockout.filter((m) => m.stage === 'THIRD_PLACE')

  if (knockout.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <p className="text-4xl mb-3">🏆</p>
        <p className="text-sm font-semibold text-black dark:text-white mb-1">Speelschema nog niet beschikbaar</p>
        <p className="text-xs text-gray-400 dark:text-zinc-500">
          De knock-outfase begint zodra de groepsfase voorbij is.
        </p>
      </div>
    )
  }

  const matchesByStage = Object.fromEntries(
    stages.map((s) => [s, knockout.filter((m) => m.stage === s)]),
  )

  // Base card height is ~88px, gap between pairs grows per round
  const baseSize = 100
  const pairSizes = stages.map((_, i) => baseSize * Math.pow(2, i))

  return (
    <div className="overflow-x-auto scroll-smooth-ios pb-4">
      <div className="flex gap-8 px-4 pt-2 pb-6" style={{ minWidth: 'max-content' }}>
        {stages.map((stage, i) => (
          <RoundColumn
            key={stage}
            stage={stage}
            matches={matchesByStage[stage]}
            onClick={onClick}
            pairSize={pairSizes[i]}
          />
        ))}
      </div>

      {/* Third place */}
      {thirdPlace.length > 0 && (
        <div className="px-4 pb-4">
          <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-2">
            Troostfinale
          </p>
          <div className="flex">
            <BracketMatch match={thirdPlace[0]} onClick={onClick} isLast />
          </div>
        </div>
      )}
    </div>
  )
}
