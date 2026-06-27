import { TrendingUp, Trophy, Search, Settings } from 'lucide-react'
import type { Tab } from '../types'

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
}

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'markets',  label: 'Markets',   Icon: TrendingUp },
  { id: 'worldcup', label: 'WK 2026',   Icon: Trophy },
  { id: 'search',   label: 'Zoeken',    Icon: Search },
  { id: 'settings', label: 'Instellingen', Icon: Settings },
]

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50"
      style={{
        background: 'var(--c-nav)',
        borderTop: '0.5px solid var(--c-sep)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
      }}
    >
      <div className="flex h-[52px]">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex-1 flex flex-col items-center justify-center gap-[3px] relative transition-opacity active:opacity-50"
              style={{ color: isActive ? 'var(--c-accent)' : 'var(--c-text4)' }}
            >
              {/* Active indicator dot */}
              {isActive && (
                <span
                  className="absolute top-1 w-1 h-1 rounded-full"
                  style={{ background: 'var(--c-accent)' }}
                />
              )}
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.6} />
              <span className={`text-[9px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
