import { fetchWithCache } from './supabase'
import type { NewsArticle, NewsFilters } from '../types'

const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY as string
const BASE = 'https://finnhub.io/api/v1'

interface FinnhubArticle {
  id: number
  headline: string
  summary: string
  source: string
  url: string
  datetime: number
  category: string
  image: string
  related: string
}

async function fetchCategory(category: string): Promise<FinnhubArticle[]> {
  const res = await fetch(`${BASE}/news?category=${category}&token=${API_KEY}`)
  if (!res.ok) throw new Error(`Finnhub error: ${res.status}`)
  return res.json()
}

async function fetchCompanyNews(symbol: string): Promise<FinnhubArticle[]> {
  const to = new Date()
  const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000) // last 7 days
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  const res = await fetch(
    `${BASE}/company-news?symbol=${symbol}&from=${fmt(from)}&to=${fmt(to)}&token=${API_KEY}`,
  )
  if (!res.ok) throw new Error(`Finnhub company news error: ${res.status}`)
  return res.json()
}

const EUROPE_KEYWORDS = /\b(DAX|FTSE|CAC|AEX|IBEX|MIB|OMX|eurostoxx|euronext|ECB|europe|european|amsterdam|frankfurt|london stock|paris bourse)\b/i
const ETF_KEYWORDS = /\bETF\b/i

function classifyArticle(
  a: FinnhubArticle,
  category: 'us' | 'europe' | 'etf' | 'crypto' | 'ticker',
): NewsArticle {
  return {
    id: String(a.id || `${a.datetime}-${a.source}`),
    headline: a.headline,
    summary: a.summary,
    source: a.source,
    url: a.url,
    datetime: a.datetime,
    category,
    related: a.related || undefined,
    image: a.image || undefined,
  }
}

/** Fetch news matching the user's active filters. Results are cached in Supabase. */
export async function fetchNews(filters: NewsFilters): Promise<NewsArticle[]> {
  const results: NewsArticle[] = []

  if (filters.us || filters.europe || filters.etfs) {
    const general = await fetchWithCache('finnhub:general', () => fetchCategory('general'), 5 * 60 * 1000)

    for (const a of general as FinnhubArticle[]) {
      const text = `${a.headline} ${a.summary}`

      if (filters.europe && EUROPE_KEYWORDS.test(text)) {
        results.push(classifyArticle(a, 'europe'))
      } else if (filters.etfs && ETF_KEYWORDS.test(text)) {
        results.push(classifyArticle(a, 'etf'))
      } else if (filters.us) {
        results.push(classifyArticle(a, 'us'))
      }
    }
  }

  if (filters.crypto) {
    const crypto = await fetchWithCache('finnhub:crypto', () => fetchCategory('crypto'), 5 * 60 * 1000)
    for (const a of crypto as FinnhubArticle[]) {
      results.push(classifyArticle(a, 'crypto'))
    }
  }

  for (const ticker of filters.tickers) {
    const key = `finnhub:ticker:${ticker.toUpperCase()}`
    const articles = await fetchWithCache(key, () => fetchCompanyNews(ticker.toUpperCase()), 5 * 60 * 1000)
    for (const a of articles as FinnhubArticle[]) {
      results.push(classifyArticle(a, 'ticker'))
    }
  }

  // Deduplicate by id, sort newest first
  const seen = new Set<string>()
  return results
    .filter((a) => {
      if (seen.has(a.id)) return false
      seen.add(a.id)
      return true
    })
    .sort((a, b) => b.datetime - a.datetime)
    .slice(0, 80)
}
