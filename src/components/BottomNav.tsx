import { TrendingUp, Trophy, Search, Settings } from 'lucide-react'
import type { Tab } from '../types'

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
}

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'markets',  label: 'Markets',   Icon: TrendingUp },
  { id: 'worldcup', label: 'World Cup', Icon: Trophy },
  { id: 'search',   label: 'Search',    Icon: Search },
  { id: 'settings', label: 'Settings',  Icon: Settings },
]

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-gray-200/60 dark:border-zinc-800/60">
      <div className="flex">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors ${
                isActive ? 'text-blue-500' : 'text-gray-400 dark:text-zinc-500'
              }`}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.2 : 1.8}
                className="transition-transform active:scale-90"
              />
              <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
