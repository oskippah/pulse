import { useEffect, useRef, useState } from 'react'
import { fetchAllQuotes, type Quote } from '../lib/quotes'

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = async () => {
    try {
      const data = await fetchAllQuotes()
      setQuotes(data)
    } catch {}
  }

  useEffect(() => {
    load()
    timer.current = setInterval(load, 60_000) // refresh every minute
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [])

  return quotes
}
