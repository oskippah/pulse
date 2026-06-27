import { createClient } from '@supabase/supabase-js'
import type { Preferences } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Client is null if env vars aren't set — all helpers below degrade gracefully
export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Fetch from Supabase cache; if stale or missing, call `fetcher()` and store result.
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = CACHE_TTL_MS,
): Promise<T> {
  if (supabase) {
    const { data: cached } = await supabase
      .from('api_cache')
      .select('data, fetched_at')
      .eq('cache_key', key)
      .maybeSingle()

    if (cached) {
      const age = Date.now() - new Date(cached.fetched_at).getTime()
      if (age < ttlMs) return cached.data as T
    }
  }

  const fresh = await fetcher()

  if (supabase) {
    await supabase.from('api_cache').upsert(
      { cache_key: key, data: fresh, fetched_at: new Date().toISOString() },
      { onConflict: 'cache_key' },
    )
  }

  return fresh
}

/** Load user preferences from Supabase, or return null if unavailable. */
export async function loadPreferences(): Promise<Preferences | null> {
  if (!supabase) return null
  const { data } = await supabase
    .from('preferences')
    .select('theme, news_filters')
    .eq('user_key', 'default')
    .maybeSingle()
  if (!data) return null
  return { theme: data.theme, newsFilters: data.news_filters }
}

/** Save user preferences to Supabase. */
export async function savePreferences(prefs: Preferences): Promise<void> {
  if (!supabase) return
  await supabase.from('preferences').upsert(
    {
      user_key: 'default',
      theme: prefs.theme,
      news_filters: prefs.newsFilters,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_key' },
  )
}
