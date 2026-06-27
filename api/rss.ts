import type { VercelRequest, VercelResponse } from '@vercel/node'

const FEEDS: Record<string, { url: string; source: string }> = {
  bloomberg: {
    url: 'https://feeds.bloomberg.com/markets/news.rss',
    source: 'Bloomberg',
  },
  reuters: {
    url: 'https://feeds.reuters.com/reuters/businessNews',
    source: 'Reuters',
  },
}

function extractTag(xml: string, tag: string): string {
  // Handles both plain and CDATA content
  const re = new RegExp(
    `<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`,
    'i',
  )
  const m = xml.match(re)
  if (!m) return ''
  return m[1]
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/<[^>]+>/g, '') // strip HTML tags from description
    .trim()
}

interface RSSItem {
  id: string
  title: string
  description: string
  link: string
  pubDate: string
  source: string
}

function parseRSS(xml: string, source: string): RSSItem[] {
  const items: RSSItem[] = []
  const itemRe = /<item>([\s\S]*?)<\/item>/g
  let m: RegExpExecArray | null

  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1]
    const link = extractTag(block, 'link') || extractTag(block, 'guid')
    const title = extractTag(block, 'title')
    const pubDate = extractTag(block, 'pubDate')
    if (!title || !link) continue

    // Stable ID from link URL
    const id = Buffer.from(link).toString('base64').slice(0, 24)

    items.push({
      id,
      title,
      description: extractTag(block, 'description'),
      link,
      pubDate,
      source,
    })
  }

  return items
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const feed = (req.query.feed as string) ?? ''
  const config = FEEDS[feed]
  if (!config) return res.status(400).json({ error: `Unknown feed: ${feed}` })

  try {
    const upstream = await fetch(config.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PulseApp/1.0)' },
    })
    if (!upstream.ok) throw new Error(`HTTP ${upstream.status}`)

    const xml = await upstream.text()
    const items = parseRSS(xml, config.source)

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=300')
    return res.status(200).json({ items })
  } catch (e) {
    return res.status(502).json({ error: String(e), items: [] })
  }
}
