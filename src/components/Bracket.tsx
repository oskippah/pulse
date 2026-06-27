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

function BracketMatch({ match, onClick }: { match: Match; onClick: (m: Match) => void }) {
  const isLive     = match.status === 'IN_PLAY' || match.status === 'PAUSED'
  const isFinished = match.status === 'FINISHED'
  const showScore  = isLive || isFinished
  const isTBD      = !match.homeTeam?.name || match.homeTeam.name === 'TBD'

  const accentLeft = isLive
    ? 'var(--c-green)'
    : isFinished
    ? 'var(--c-sep)'
    : 'var(--c-accent)'

  return (
    <button
      onClick={() => onClick(match)}
      className="w-44 text-left flex flex-col gap-1.5 p-2.5 rounded-xl active:scale-95 transition-transform"
      style={{
        background: 'var(--c-surface)',
        border: `0.5px solid var(--c-sep)`,
        borderLeft: `3px solid ${accentLeft}`,
        boxShadow: '0 1px 3px var(--c-shadow)',
      }}
    >
      {/* Date/time */}
      <span className="text-[9px] font-medium" style={{ color: 'var(--c-text4)' }}>
        {formatTime(match.utcDate)}
      </span>

      {/* Home */}
      <div className="flex items-center gap-1.5">
        {match.homeTeam?.crest
          ? <img src={match.homeTeam.crest} className="w-5 h-5 object-contain shrink-0" alt="" />
          : <span className="w-5 h-5 rounded-full shrink-0" style={{ background: 'var(--c-surface2)' }} />
        }
        <span
          className="text-[12px] font-semibold truncate flex-1"
          style={{ color: isFinished ? 'var(--c-text3)' : 'var(--c-text)' }}
        >
          {isTBD ? 'TBD' : (match.homeTeam?.shortName || match.homeTeam?.name || 'TBD')}
        </span>
        {showScore && (
          <span
            className="text-[13px] font-bold w-4 text-right"
            style={{ color: isLive ? 'var(--c-green)' : 'var(--c-text)' }}
          >
            {match.score.fullTime.home ?? 0}
          </span>
        )}
      </div>

      {/* Away */}
      <div className="flex items-center gap-1.5">
        {match.awayTeam?.crest
          ? <img src={match.awayTeam.crest} className="w-5 h-5 object-contain shrink-0" alt="" />
          : <span className="w-5 h-5 rounded-full shrink-0" style={{ background: 'var(--c-surface2)' }} />
        }
        <span
          className="text-[12px] font-semibold truncate flex-1"
          style={{ color: isFinished ? 'var(--c-text3)' : 'var(--c-text)' }}
        >
          {isTBD ? 'TBD' : (match.awayTeam?.shortName || match.awayTeam?.name || 'TBD')}
        </span>
        {showScore && (
          <span
            className="text-[13px] font-bold w-4 text-right"
            style={{ color: isLive ? 'var(--c-green)' : 'var(--c-text)' }}
          >
            {match.score.fullTime.away ?? 0}
          </span>
        )}
      </div>

      {isLive && (
        <span className="text-[9px] font-bold flex items-center gap-1" style={{ color: 'var(--c-green)' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--c-green)' }} />
          LIVE
        </span>
      )}
      {isFinished && (
        <span className="text-[9px] font-medium" style={{ color: 'var(--c-text4)' }}>Afgelopen</span>
      )}
    </button>
  )
}

function RoundColumn({ stage, matches, onClick, pairSize }: {
  stage: string; matches: Match[]; onClick: (m: Match) => void; pairSize: number
}) {
  return (
    <div className="flex flex-col shrink-0">
      {/* Round label */}
      <div className="h-8 flex items-center justify-center mb-3">
        <span
          className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
          style={{ color: 'var(--c-text4)' }}
        >
          {STAGE_LABEL[stage] ?? stage.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="flex flex-col" style={{ gap: `${Math.max(0, pairSize - 92)}px` }}>
        {matches.map((match, i) => (
          <div key={match.id} className="relative flex items-center">
            {/* Vertical bracket connector between pair */}
            {i % 2 === 0 && matches[i + 1] && (
              <div
                className="absolute pointer-events-none"
                style={{
                  top: 46,
                  right: -16,
                  width: 16,
                  height: pairSize - 46,
                  borderRight: `2px solid var(--c-sep)`,
                  borderTop: `2px solid var(--c-sep)`,
                  borderBottom: `2px solid var(--c-sep)`,
                  borderRadius: '0 6px 6px 0',
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
  const knockout = matches.filter(
    (m) => STAGE_ORDER.includes(m.stage) || m.stage === 'THIRD_PLACE',
  )

  const stages = STAGE_ORDER.filter((s) => knockout.some((m) => m.stage === s))
  const thirdPlace = knockout.filter((m) => m.stage === 'THIRD_PLACE')

  if (knockout.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <p className="text-4xl mb-3">🏆</p>
        <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--c-text)' }}>
          Speelschema nog niet beschikbaar
        </p>
        <p className="text-[13px]" style={{ color: 'var(--c-text4)' }}>
          De knock-outfase begint zodra de groepsfase voorbij is.
        </p>
      </div>
    )
  }

  const matchesByStage = Object.fromEntries(
    stages.map((s) => [s, knockout.filter((m) => m.stage === s)]),
  )

  const baseSize = 100
  const pairSizes = stages.map((_, i) => baseSize * Math.pow(2, i))

  return (
    <div className="overflow-x-auto pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
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

      {thirdPlace.length > 0 && (
        <div className="px-4 pb-4">
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-2"
            style={{ color: 'var(--c-text4)' }}
          >
            Troostfinale
          </p>
          <BracketMatch match={thirdPlace[0]} onClick={onClick} />
        </div>
      )}
    </div>
  )
}
