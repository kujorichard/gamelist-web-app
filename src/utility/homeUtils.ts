import type { GameSortBy, GameSummary } from '../types/game'

export type PlatformFilter = 'all' | 'pc' | 'browser'

export const platformLabels: Record<PlatformFilter, string> = {
  all: 'All',
  pc: 'PC',
  browser: 'Browser',
}

export const sortLabels: Record<GameSortBy, string> = {
  popularity: 'Popular',
  'release-date': 'Newest',
  alphabetical: 'A-Z',
  relevance: 'Relevance',
}

export const formatPlatform = (platform: string) => {
  if (platform.includes('Windows')) {
    return 'PC'
  }
  if (platform.includes('Browser')) {
    return 'Browser'
  }
  return platform
}

export const formatCode = (id: number) => {
  return `GX-${String(id).slice(-4).padStart(4, '0')}`
}

export const getReleaseYear = (releaseDate: string) => {
  const year = Number(releaseDate.slice(0, 4))
  return Number.isFinite(year) ? year : null
}

export const getReleaseTier = (year: number | null) => {
  if (!year) {
    return 'unknown'
  }
  if (year >= 2022) {
    return 'recent'
  }
  if (year >= 2017) {
    return 'established'
  }
  return 'legacy'
}

export const getNewestRelease = (games: GameSummary[]) => {
  return games.reduce<GameSummary | null>((latest, game) => {
    const currentDate = new Date(game.release_date)
    if (Number.isNaN(currentDate.getTime())) {
      return latest
    }
    if (!latest) {
      return game
    }
    const latestDate = new Date(latest.release_date)
    return currentDate > latestDate ? game : latest
  }, null)
}

export const getYearRange = (games: GameSummary[]) => {
  const years = games
    .map((game) => getReleaseYear(game.release_date))
    .filter((year): year is number => year !== null)

  if (years.length === 0) {
    return null
  }

  return {
    min: Math.min(...years),
    max: Math.max(...years),
  }
}

export const formatCount = (value: number) => value.toLocaleString('en-US')

export const formatTime = (date: Date) =>
  date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

export const matchesPlatform = (game: GameSummary, platform: PlatformFilter) => {
  if (platform === 'pc') {
    return game.platform.includes('Windows')
  }
  if (platform === 'browser') {
    return game.platform.includes('Browser')
  }
  return true
}

export const sortGames = (
  games: GameSummary[],
  sortMode: GameSortBy,
  popularityRank: Map<number, number>,
) => {
  const sorted = [...games]

  if (sortMode === 'alphabetical') {
    sorted.sort((a, b) => a.title.localeCompare(b.title))
  }

  if (sortMode === 'release-date') {
    sorted.sort(
      (a, b) =>
        new Date(b.release_date).getTime() -
        new Date(a.release_date).getTime(),
    )
  }

  if (sortMode === 'popularity' && popularityRank.size > 0) {
    sorted.sort((a, b) => {
      const rankA = popularityRank.get(a.id) ?? Number.MAX_SAFE_INTEGER
      const rankB = popularityRank.get(b.id) ?? Number.MAX_SAFE_INTEGER
      return rankA - rankB
    })
  }

  if (sortMode === 'relevance') {
    sorted.sort((a, b) => {
      const genreCompare = a.genre.localeCompare(b.genre)
      if (genreCompare !== 0) {
        return genreCompare
      }
      return a.title.localeCompare(b.title)
    })
  }

  return sorted
}
