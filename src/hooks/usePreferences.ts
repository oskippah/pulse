import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_PREFERENCES } from '../types'
import type { Preferences } from '../types'
import { loadPreferences, savePreferences } from '../lib/supabase'

const LS_KEY = 'pulse:preferences'

function loadLocal(): Preferences {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) }
  } catch {}
  return DEFAULT_PREFERENCES
}

export function usePreferences() {
  const [prefs, setPrefsState] = useState<Preferences>(loadLocal)

  // On mount: load from Supabase but never override theme (keep it local-only)
  useEffect(() => {
    loadPreferences().then((remote) => {
      if (remote) {
        setPrefsState((p) => ({
          ...p,
          ...remote,
          theme: p.theme, // theme is local-only — Supabase must never override it
        }))
      }
    })
  }, [])

  const setPrefs = useCallback((next: Preferences | ((p: Preferences) => Preferences)) => {
    setPrefsState((prev) => {
      const updated = typeof next === 'function' ? next(prev) : next
      localStorage.setItem(LS_KEY, JSON.stringify(updated))
      savePreferences(updated) // fire-and-forget
      return updated
    })
  }, [])

  return { prefs, setPrefs }
}
