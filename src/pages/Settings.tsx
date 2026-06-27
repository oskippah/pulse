import { useState } from 'react'
import { Sun, Moon, Smartphone, Check } from 'lucide-react'
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
      className="relative inline-flex h-[30px] w-[51px] shrink-0 items-center rounded-full transition-colors duration-200"
      style={{ background: enabled ? 'var(--c-green)' : 'var(--c-sep)' }}
    >
      <span
        className="inline-block h-[26px] w-[26px] transform rounded-full bg-white shadow-md transition-transform duration-200"
        style={{ transform: enabled ? 'translateX(23px)' : 'translateX(2px)' }}
      />
    </button>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p
      className="text-[13px] font-semibold uppercase tracking-wide px-4 pt-6 pb-1"
      style={{ color: 'var(--c-text3)' }}
    >
      {title}
    </p>
  )
}


const THEMES: { value: Theme; label: string; Icon: React.ElementType }[] = [
  { value: 'light',  label: 'Licht',  Icon: Sun },
  { value: 'dark',   label: 'Donker', Icon: Moon },
  { value: 'system', label: 'Systeem', Icon: Smartphone },
]

export function Settings({ prefs, onChange }: Props) {
  const [tickerInput, setTickerInput] = useState('')

  const setTheme = (t: Theme) => onChange({ ...prefs, theme: t })

  const toggleFilter = (key: keyof Omit<typeof prefs.newsFilters, 'tickers'>) => {
    onChange({ ...prefs, newsFilters: { ...prefs.newsFilters, [key]: !prefs.newsFilters[key] } })
  }

  const addTicker = () => {
    const sym = tickerInput.trim().toUpperCase()
    if (!sym || prefs.newsFilters.tickers.includes(sym)) { setTickerInput(''); return }
    onChange({ ...prefs, newsFilters: { ...prefs.newsFilters, tickers: [...prefs.newsFilters.tickers, sym] } })
    setTickerInput('')
  }

  const removeTicker = (sym: string) => {
    onChange({ ...prefs, newsFilters: { ...prefs.newsFilters, tickers: prefs.newsFilters.tickers.filter((t) => t !== sym) } })
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Instellingen" />
      <div className="flex-1 scroll-ios mb-nav px-4">

        {/* Appearance */}
        <SectionHeader title="Weergave" />
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--c-surface)', boxShadow: '0 1px 3px var(--c-shadow)' }}>
          {THEMES.map(({ value, label, Icon }, i) => (
            <div
              key={value}
              className={`flex items-center gap-3 px-4 py-3.5 ${i < THEMES.length - 1 ? 'border-b' : ''}`}
              style={{ borderColor: 'var(--c-sep)' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: value === 'light' ? '#FFF5CC' : value === 'dark' ? '#1C1C2E' : 'rgba(10,132,255,0.12)' }}>
                <Icon size={16} color={value === 'light' ? 'var(--c-yellow)' : value === 'dark' ? '#BF5AF2' : 'var(--c-accent)'} />
              </div>
              <span className="flex-1 text-[15px] font-medium" style={{ color: 'var(--c-text)' }}>{label}</span>
              <button
                onClick={() => setTheme(value)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                {prefs.theme === value
                  ? <Check size={18} strokeWidth={2.5} color="var(--c-accent)" />
                  : <span className="w-5 h-5 rounded-full border-2" style={{ borderColor: 'var(--c-sep)' }} />
                }
              </button>
            </div>
          ))}
        </div>

        {/* News categories */}
        <SectionHeader title="Nieuwscategorieën" />
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--c-surface)', boxShadow: '0 1px 3px var(--c-shadow)' }}>
          {[
            { key: 'us' as const,      label: 'US Markets',     sub: 'NYSE & NASDAQ nieuws',       color: 'var(--c-accent)' },
            { key: 'europe' as const,  label: 'Europa',          sub: 'DAX, FTSE, AEX, ECB',       color: 'var(--c-purple)' },
            { key: 'etfs' as const,    label: 'ETF\'s',          sub: 'Exchange-traded funds',     color: 'var(--c-green)' },
            { key: 'crypto' as const,  label: 'Crypto',          sub: 'Bitcoin, Ethereum & meer',  color: 'var(--c-orange)' },
          ].map(({ key, label, sub, color }, i, arr) => (
            <div
              key={key}
              className={`flex items-center gap-3 px-4 py-3 ${i < arr.length - 1 ? 'border-b' : ''}`}
              style={{ borderColor: 'var(--c-sep)' }}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium" style={{ color: 'var(--c-text)' }}>{label}</p>
                <p className="text-[12px]" style={{ color: 'var(--c-text3)' }}>{sub}</p>
              </div>
              <Toggle enabled={prefs.newsFilters[key]} onToggle={() => toggleFilter(key)} />
            </div>
          ))}
        </div>

        {/* RSS Feeds */}
        <SectionHeader title="RSS-feeds" />
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--c-surface)', boxShadow: '0 1px 3px var(--c-shadow)' }}>
          {[
            { key: 'bloomberg' as const, label: 'Bloomberg', sub: 'Bloomberg Markets — live updates', color: 'var(--c-text)' },
            { key: 'reuters' as const,   label: 'Reuters',   sub: 'Reuters Business News RSS',       color: 'var(--c-orange)' },
          ].map(({ key, label, sub, color }, i, arr) => (
            <div
              key={key}
              className={`flex items-center gap-3 px-4 py-3 ${i < arr.length - 1 ? 'border-b' : ''}`}
              style={{ borderColor: 'var(--c-sep)' }}
            >
              <span className="text-[13px] font-bold shrink-0 w-20" style={{ color }}>{label}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px]" style={{ color: 'var(--c-text3)' }}>{sub}</p>
              </div>
              <Toggle enabled={prefs.newsFilters[key] ?? true} onToggle={() => toggleFilter(key)} />
            </div>
          ))}
        </div>

        {/* Custom tickers */}
        <SectionHeader title="Eigen tickers" />
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--c-surface)', boxShadow: '0 1px 3px var(--c-shadow)' }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--c-sep)' }}>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ASML, AMZN, NVDA…"
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && addTicker()}
                className="flex-1 rounded-xl px-3 py-2.5 text-[14px] outline-none"
                style={{
                  background: 'var(--c-surface2)',
                  color: 'var(--c-text)',
                  border: '1px solid var(--c-sep)',
                }}
              />
              <button
                onClick={addTicker}
                className="text-[14px] font-semibold px-4 py-2.5 rounded-xl"
                style={{ background: 'var(--c-accent)', color: '#fff' }}
              >
                Voeg toe
              </button>
            </div>
          </div>

          {prefs.newsFilters.tickers.length === 0
            ? <div className="px-4 py-4">
                <p className="text-[13px]" style={{ color: 'var(--c-text3)' }}>Nog geen tickers toegevoegd.</p>
              </div>
            : prefs.newsFilters.tickers.map((sym, i, arr) => (
                <div
                  key={sym}
                  className={`flex items-center justify-between px-4 py-3.5 ${i < arr.length - 1 ? 'border-b' : ''}`}
                  style={{ borderColor: 'var(--c-sep)' }}
                >
                  <span className="text-[15px] font-semibold" style={{ color: 'var(--c-text)' }}>{sym}</span>
                  <button
                    onClick={() => removeTicker(sym)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[13px] font-semibold"
                    style={{ color: 'var(--c-red)' }}
                  >
                    Verwijder
                  </button>
                </div>
              ))
          }
        </div>

        {/* About */}
        <SectionHeader title="Over" />
        <div className="rounded-2xl overflow-hidden mb-6" style={{ background: 'var(--c-surface)', boxShadow: '0 1px 3px var(--c-shadow)' }}>
          {[
            { label: 'Pulse',         sub: 'Financiën & WK 2026 dashboard' },
            { label: 'Nieuws API',    sub: 'Finnhub.io (gratis tier)' },
            { label: 'Voetbal API',   sub: 'football-data.org (gratis tier)' },
            { label: 'RSS',           sub: 'Bloomberg & Reuters' },
          ].map(({ label, sub }, i, arr) => (
            <div
              key={label}
              className={`flex items-center justify-between px-4 py-3 ${i < arr.length - 1 ? 'border-b' : ''}`}
              style={{ borderColor: 'var(--c-sep)' }}
            >
              <p className="text-[15px] font-medium" style={{ color: 'var(--c-text)' }}>{label}</p>
              <p className="text-[13px]" style={{ color: 'var(--c-text3)' }}>{sub}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
