interface Props {
  prices: number[]
  width?: number
  height?: number
}

export function Sparkline({ prices, width = 80, height = 36 }: Props) {
  if (prices.length < 2) return null

  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1

  const pts = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * width
    const y = height - ((p - min) / range) * (height - 4) - 2
    return `${x},${y}`
  })

  const up = prices[prices.length - 1] >= prices[0]
  const color = up ? '#30D158' : '#FF453A'
  const fillColor = up ? 'rgba(48,209,88,0.1)' : 'rgba(255,69,58,0.1)'

  const fillPath = `M${pts[0]} L${pts.join(' L')} L${width},${height} L0,${height} Z`
  const linePath = `M${pts.join(' L')}`

  const pct = ((prices[prices.length - 1] - prices[0]) / Math.abs(prices[0])) * 100

  return (
    <div className="flex items-center gap-2 mt-2">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <path d={fillPath} fill={fillColor} />
        <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-[12px] font-bold tabular-nums" style={{ color }}>
        {up ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%
      </span>
      <span className="text-[11px]" style={{ color: 'var(--c-text4)' }}>5d</span>
    </div>
  )
}
