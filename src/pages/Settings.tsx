import { useState } from 'react'
import { Header } from '../components/Header'
import type { Preferences, Theme } from '../types'

interface Props {
  prefs: Preferences
  onChange: (prefs: Preferences) => void
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-500' : 'bg-gray-200 dark:bg-zinc-700'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-4 mb-2">
        {title}
      </p>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function Row({
  label,
  sublabel,
  right,
}: {
  label: string
  sublabel?: string
  right: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b last:border-b-0 border-gray-100 dark:border-zinc-800">
      <div>
        <p className="text-sm font-medium text-black dark:text-white">{label}</p>
        {sublabel && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sublabel}</p>}
      </div>
      {right}
    </div>
  )
}

export function Settings({ prefs, onChange }: Props) {
  const [tickerInput, setTickerInput] = useState('')

  const setTheme = (t: Theme) => onChange({ ...prefs, theme: t })

  const toggleFilter = (key: keyof Omit<typeof prefs.newsFilters, 'tickers'>) => {
    onChange({
      ...prefs,
      newsFilters: { ...prefs.newsFilters, [key]: !prefs.newsFilters[key] },
    })
  }

  const addTicker = () => {
    const sym = tickerInput.trim().toUpperCase()
    if (!sym || prefs.newsFilters.tickers.includes(sym)) {
      setTickerInput('')
      return
    }
    onChange({
      ...prefs,
      newsFilters: { ...prefs.newsFilters, tickers: [...prefs.newsFilters.tickers, sym] },
    })
    setTickerInput('')
  }

  const removeTicker = (sym: string) => {
    onChange({
      ...prefs,
      newsFilters: {
        ...prefs.newsFilters,
        tickers: prefs.newsFilters.tickers.filter((t) => t !== sym),
      },
    })
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" />
      <div className="flex-1 overflow-y-auto scroll-smooth-ios pb-24 px-4 py-4">

        {/* Appearance */}
        <Section title="Appearance">
          {(['light', 'dark', 'system'] as Theme[]).map((t) => (
            <Row
              key={t}
              label={t.charAt(0).toUpperCase() + t.slice(1)}
              sublabel={
                t === 'system' ? 'Follow system preference' :
                t === 'dark' ? 'True black, Apple-style' : undefined
              }
              right={
                <button
                  onClick={() => setTheme(t)}
                  className={`text-sm font-medium ${
                    prefs.theme === t
                      ? 'text-blue-500'
                      : 'text-gray-300 dark:text-zinc-600'
                  }`}
                >
                  {prefs.theme === t ? '✓' : ''}
                </button>
              }
            />
          ))}
        </Section>

        {/* News filters */}
        <Section title="News Categories">
          <Row
            label="US Markets"
            sublabel="NYSE, NASDAQ general news"
            right={<Toggle enabled={prefs.newsFilters.us} onToggle={() => toggleFilter('us')} />}
          />
          <Row
            label="European Markets"
            sublabel="DAX, FTSE, AEX, ECB news"
            right={<Toggle enabled={prefs.newsFilters.europe} onToggle={() => toggleFilter('europe')} />}
          />
          <Row
            label="ETFs"
            sublabel="ETF-related headlines"
            right={<Toggle enabled={prefs.newsFilters.etfs} onToggle={() => toggleFilter('etfs')} />}
          />
          <Row
            label="Crypto"
            sublabel="Bitcoin, Ethereum, altcoins"
            right={<Toggle enabled={prefs.newsFilters.crypto} onToggle={() => toggleFilter('crypto')} />}
          />
        </Section>

        {/* RSS Feeds */}
        <Section title="RSS Feeds">
          <Row
            label="Bloomberg"
            sublabel="Bloomberg Markets RSS — live updates"
            right={<Toggle enabled={prefs.newsFilters.bloomberg ?? true} onToggle={() => toggleFilter('bloomberg')} />}
          />
          <Row
            label="Reuters"
            sublabel="Reuters Business News RSS"
            right={<Toggle enabled={prefs.newsFilters.reuters ?? true} onToggle={() => toggleFilter('reuters')} />}
          />
        </Section>

        {/* Custom tickers */}
        <Section title="Individual Tickers">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. ASML, AMZN"
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && addTicker()}
                className="flex-1 bg-gray-100 dark:bg-zinc-800 rounded-xl px-3 py-2 text-sm text-black dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <button
                onClick={addTicker}
                className="bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl"
              >
                Add
              </button>
            </div>
          </div>

          {prefs.newsFilters.tickers.length === 0 ? (
            <div className="px-4 py-3">
              <p className="text-xs text-gray-400 dark:text-gray-500">No tickers added yet.</p>
            </div>
          ) : (
            prefs.newsFilters.tickers.map((sym) => (
              <Row
                key={sym}
                label={sym}
                right={
                  <button
                    onClick={() => removeTicker(sym)}
                    className="text-red-500 text-sm font-medium"
                  >
                    Remove
                  </button>
                }
              />
            ))
          )}
        </Section>

        {/* Info */}
        <Section title="About">
          <Row label="Pulse" sublabel="Personal finance & football dashboard" right={null} />
          <Row label="News API" sublabel="Finnhub.io (free tier)" right={null} />
          <Row label="Football API" sublabel="football-data.org (free tier)" right={null} />
        </Section>
      </div>
    </div>
  )
}
