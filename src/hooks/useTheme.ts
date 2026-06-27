import { useEffect, useState } from 'react'
import type { Theme } from '../types'

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

export function useTheme(initial: Theme = 'dark') {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('pulse:theme') as Theme) ?? initial
  })

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem('pulse:theme', theme)
  }, [theme])

  // Re-apply if system preference changes while app is open
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  // Apply on first render
  useEffect(() => { applyTheme(theme) }, [])

  return { theme, setTheme: setThemeState }
}
