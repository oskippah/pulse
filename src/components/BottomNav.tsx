import { TrendingUp, Trophy, Search, Settings } from 'lucide-react'
import type { Tab } from '../types'

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
}

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'markets',  label: 'Markets',   Icon: TrendingUp },
  { id: 'worldcup', label: 'World Cup', Icon: Trophy },
  { id: 'search',   label: 'Zoeken',    Icon: Search },
  { id: 'settings', label: 'Instellingen', Icon: Settings },
]

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 pb-safe"
      style={{
        background: 'var(--c-nav)',
        borderTop: '0.5px solid var(--c-sep)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      <div className="flex">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-opacity active:opacity-60"
              style={{ color: isActive ? 'var(--c-accent)' : 'var(--c-text3)' }}
            >
              <Icon
                size={24}
                strokeWidth={isActive ? 2.2 : 1.6}
              />
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
