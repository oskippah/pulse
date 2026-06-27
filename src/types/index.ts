export type Tab = 'markets' | 'worldcup' | 'search' | 'settings'
export type Theme = 'light' | 'dark' | 'system'

export interface NewsFilters {
  us: boolean
  europe: boolean
  etfs: boolean
  crypto: boolean
  tickers: string[]
  bloomberg: boolean
  reuters: boolean
}

export interface Preferences {
  theme: Theme
  newsFilters: NewsFilters
  favoriteTeamIds: number[]
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'dark',
  newsFilters: {
    us: true,
    europe: false,
    etfs: false,
    crypto: false,
    tickers: [],
    bloomberg: true,
    reuters: true,
  },
  favoriteTeamIds: [],
}

export interface NewsArticle {
  id: string
  headline: string
  summary: string
  source: string
  url: string
  datetime: number // Unix timestamp (seconds)
  category: 'us' | 'europe' | 'etf' | 'crypto' | 'ticker'
  related?: string // ticker symbol
  image?: string
}

export interface Team {
  id: number
  name: string
  shortName: string
  tla: string
  crest: string
}

export interface Score {
  home: number | null
  away: number | null
}

export type MatchStatus =
  | 'SCHEDULED'
  | 'TIMED'
  | 'IN_PLAY'
  | 'PAUSED'
  | 'FINISHED'
  | 'SUSPENDED'
  | 'POSTPONED'
  | 'CANCELLED'

export interface Venue {
  id: number
  name: string
  city: string
}

export interface Match {
  id: number
  utcDate: string
  status: MatchStatus
  stage: string
  group: string | null
  venue?: Venue
  homeTeam: Team
  awayTeam: Team
  score: {
    fullTime: Score
    halfTime: Score
  }
}

export interface Player {
  id: number
  name: string
  position?: string
  shirtNumber?: number
}

export interface Statistic {
  type: string
  home: string | number | null
  away: string | number | null
}

export interface MatchDetail extends Match {
  homeTeam: Team & { lineup?: Player[]; bench?: Player[] }
  awayTeam: Team & { lineup?: Player[]; bench?: Player[] }
  homeTeamStatistics?: Statistic[]
  awayTeamStatistics?: Statistic[]
  referees?: { name: string; role: string }[]
}

export interface Standing {
  position: number
  team: Team
  playedGames: number
  won: number
  draw: number
  lost: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}

export interface GroupStanding {
  stage: string
  type: string
  group: string | null
  table: Standing[]
}
