import type { NewsArticle } from '../types'

interface RSSItem {
  id: string
  title: string
  description: string
  link: string
  pubDate: string
  source: string
}

async function fetchFeed(feed: 'bloomberg' | 'reuters'): Promise<RSSItem[]> {
  const res = await fetch(`/api/rss?feed=${feed}`)
  if (!res.ok) return []
  const data = await res.json()
  return data.items ?? []
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')         // remove HTML tags
    .replace(/https?:\/\/\S+/g, '')   // remove URLs (iOS Safari auto-links them)
    .replace(/\s{2,}/g, ' ')          // collapse whitespace
    .trim()
}

function toArticle(item: RSSItem, feed: 'bloomberg' | 'reuters'): NewsArticle {
  const datetime = item.pubDate ? Math.floor(new Date(item.pubDate).getTime() / 1000) : Math.floor(Date.now() / 1000)
  return {
    id: `rss-${feed}-${item.id}`,
    headline: stripHtml(item.title),
    summary: stripHtml(item.description),
    source: item.source,
    url: item.link,
    datetime,
    category: 'us', // financial RSS → US category
  }
}

export async function fetchRSSFeeds(
  bloomberg: boolean,
  reuters: boolean,
): Promise<NewsArticle[]> {
  const tasks: Promise<NewsArticle[]>[] = []

  if (bloomberg)
    tasks.push(fetchFeed('bloomberg').then((items) => items.map((i) => toArticle(i, 'bloomberg'))))
  if (reuters)
    tasks.push(fetchFeed('reuters').then((items) => items.map((i) => toArticle(i, 'reuters'))))

  const results = await Promise.allSettled(tasks)
  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
}
