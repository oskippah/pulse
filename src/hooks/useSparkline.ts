import { useEffect, useRef, useState } from 'react'

const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY as string
const CACHE = new Map<string, { prices: number[]; ts: number }>()
const TTL = 5 * 60 * 1000

export function useSparkline(symbol: string | undefined) {
  const [prices, setPrices] = useState<number[]>([])
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    if (!symbol) return
    const key = symbol.toUpperCase()

    const cached = CACHE.get(key)
    if (cached && Date.now() - cached.ts < TTL) { setPrices(cached.prices); return }

    const to = Math.floor(Date.now() / 1000)
    const from = to - 5 * 24 * 60 * 60
    fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${key}&resolution=D&from=${from}&to=${to}&token=${API_KEY}`)
      .then((r) => r.json())
      .then((d) => {
        if (!mounted.current) return
        const c: number[] = d?.c ?? []
        if (c.length > 1) {
          CACHE.set(key, { prices: c, ts: Date.now() })
          setPrices(c)
        }
      })
      .catch(() => {})

    return () => { mounted.current = false }
  }, [symbol])

  return prices
}
