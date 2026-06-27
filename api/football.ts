import type { VercelRequest, VercelResponse } from '@vercel/node'

const BASE = 'https://api.football-data.org/v4'
const API_KEY = process.env.VITE_FOOTBALL_API_KEY ?? ''

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = (req.query.path as string) ?? ''
  if (!path) return res.status(400).json({ error: 'Missing path' })

  try {
    const upstream = await fetch(`${BASE}${path}`, {
      headers: { 'X-Auth-Token': API_KEY },
    })

    const data = await upstream.json()
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(upstream.status).json(data)
  } catch (e) {
    return res.status(500).json({ error: String(e) })
  }
}
