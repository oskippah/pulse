import { useState } from 'react'
import { BottomNav } from './components/BottomNav'
import { Markets } from './pages/Markets'
import { WorldCup } from './pages/WorldCup'
import { Search } from './pages/Search'
import { Settings } from './pages/Settings'
import { useTheme } from './hooks/useTheme'
import { usePreferences } from './hooks/usePreferences'
import type { Match, Tab } from './types'

export default function App() {
  const [tab, setTab] = useState<Tab>('markets')
  const { prefs, setPrefs } = usePreferences()
  const { theme, setTheme } = useTheme(prefs.theme)
  const [pendingMatch, setPendingMatch] = useState<Match | null>(null)

  const handlePrefsChange = (next: typeof prefs) => {
    setPrefs(next)
    if (next.theme !== theme) setTheme(next.theme)
  }

  const toggleFavorite = (teamId: number) => {
    setPrefs((p) => ({
      ...p,
      favoriteTeamIds: p.favoriteTeamIds.includes(teamId)
        ? p.favoriteTeamIds.filter((id) => id !== teamId)
        : [...p.favoriteTeamIds, teamId],
    }))
  }

  const handleMatchFromSearch = (match: Match) => {
    setPendingMatch(match)
    setTab('worldcup')
  }

  return (
    <div className="min-h-svh bg-gray-50 dark:bg-black text-black dark:text-white">
      <div className="h-svh flex flex-col overflow-hidden">
        <div className={tab === 'markets' ? 'flex flex-col flex-1 overflow-hidden' : 'hidden'}>
          <Markets
            filters={prefs.newsFilters}
            favoriteTeamIds={prefs.favoriteTeamIds}
            onMatchClick={(m) => { setPendingMatch(m); setTab('worldcup') }}
          />
        </div>
        <div className={tab === 'worldcup' ? 'flex flex-col flex-1 overflow-hidden' : 'hidden'}>
          <WorldCup
            favoriteTeamIds={prefs.favoriteTeamIds}
            onToggleFavorite={toggleFavorite}
            initialMatch={pendingMatch}
            onNavigated={() => setPendingMatch(null)}
          />
        </div>
        <div className={tab === 'search' ? 'flex flex-col flex-1 overflow-hidden' : 'hidden'}>
          <Search filters={prefs.newsFilters} onMatchSelect={handleMatchFromSearch} />
        </div>
        <div className={tab === 'settings' ? 'flex flex-col flex-1 overflow-hidden' : 'hidden'}>
          <Settings prefs={prefs} onChange={handlePrefsChange} />
        </div>
      </div>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
