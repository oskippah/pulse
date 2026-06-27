const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_API_KEY as string

export interface Quote {
  symbol: string
  label: string
  price: number
  change: number
  changePercent: number
  currency: string
}

const TRACKED = [
  { symbol: 'SPY',  label: 'S&P 500', currency: '$' },
  { symbol: 'QQQ',  label: 'NASDAQ',  currency: '$' },
  { symbol: 'ASML', label: 'ASML',    currency: '$' },
]

async function fetchFinnhubQuote(symbol: string): Promise<{ c: number; d: number; dp: number }> {
  const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`)
  if (!r.ok) throw new Error(`Quote error ${r.status}`)
  return r.json()
}

async function fetchCryptoQuotes(): Promise<Quote[]> {
  const r = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true',
  )
  if (!r.ok) return []
  const data = await r.json()
  return [
    {
      symbol: 'BTC',
      label: 'Bitcoin',
      price: data.bitcoin?.usd ?? 0,
      change: 0,
      changePercent: data.bitcoin?.usd_24h_change ?? 0,
      currency: '$',
    },
    {
      symbol: 'ETH',
      label: 'Ethereum',
      price: data.ethereum?.usd ?? 0,
      change: 0,
      changePercent: data.ethereum?.usd_24h_change ?? 0,
      currency: '$',
    },
  ]
}

export async function fetchAllQuotes(): Promise<Quote[]> {
  const [stockResults, cryptoQuotes] = await Promise.allSettled([
    Promise.all(
      TRACKED.map(async ({ symbol, label, currency }) => {
        const q = await fetchFinnhubQuote(symbol)
        return { symbol, label, price: q.c, change: q.d, changePercent: q.dp, currency } as Quote
      }),
    ),
    fetchCryptoQuotes(),
  ])

  const stocks = stockResults.status === 'fulfilled' ? stockResults.value : []
  const crypto = cryptoQuotes.status === 'fulfilled' ? cryptoQuotes.value : []
  return [...stocks, ...crypto]
}
