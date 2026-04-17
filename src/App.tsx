import { useMemo, useState, type CSSProperties } from 'react'
import './App.css'
import { useGetGamesQuery, useGetGamesSortedQuery } from './rtk/gameApi'
import type { GameSortBy, GameSummary } from './types/game'

const formatPlatform = (platform: string) => {
  if (platform.includes('Windows')) {
    return 'PC'
  }
  if (platform.includes('Browser')) {
    return 'Browser'
  }
  return platform
}

const formatCode = (id: number) => {
  return `GX-${String(id).slice(-4).padStart(4, '0')}`
}

const getReleaseYear = (releaseDate: string) => {
  const year = Number(releaseDate.slice(0, 4))
  return Number.isFinite(year) ? year : null
}

const getReleaseTier = (year: number | null) => {
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

const getNewestRelease = (games: GameSummary[]) => {
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

const getYearRange = (games: GameSummary[]) => {
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

const formatCount = (value: number) => value.toLocaleString('en-US')

const formatTime = (date: Date) =>
  date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

type PlatformFilter = 'all' | 'pc' | 'browser'

const platformLabels: Record<PlatformFilter, string> = {
  all: 'All',
  pc: 'PC',
  browser: 'Browser',
}

const sortLabels: Record<GameSortBy, string> = {
  popularity: 'Popular',
  'release-date': 'Newest',
  alphabetical: 'A-Z',
  relevance: 'Relevance',
}

const matchesPlatform = (game: GameSummary, platform: PlatformFilter) => {
  if (platform === 'pc') {
    return game.platform.includes('Windows')
  }
  if (platform === 'browser') {
    return game.platform.includes('Browser')
  }
  return true
}

const sortGames = (
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

function App() {
  const { data: games = [], isLoading, isError } = useGetGamesQuery()
  const { data: popularityGames = [] } = useGetGamesSortedQuery('popularity')
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all')
  const [sortMode, setSortMode] = useState<GameSortBy>('popularity')
  const [genreFilter, setGenreFilter] = useState('all')

  const popularityRank = useMemo(() => {
    const ranks = new Map<number, number>()
    popularityGames.forEach((game, index) => {
      ranks.set(game.id, index)
    })
    return ranks
  }, [popularityGames])

  const genreOptions = useMemo(() => {
    const counts = new Map<string, number>()
    games.forEach((game) => {
      if (!game.genre) {
        return
      }
      counts.set(game.genre, (counts.get(game.genre) ?? 0) + 1)
    })

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8)
      .map(([genre]) => genre)
  }, [games])

  const filteredGames = useMemo(() => {
    const platformFiltered = games.filter((game) =>
      matchesPlatform(game, platformFilter),
    )
    const genreFiltered =
      genreFilter === 'all'
        ? platformFiltered
        : platformFiltered.filter((game) => game.genre === genreFilter)

    return sortGames(genreFiltered, sortMode, popularityRank)
  }, [games, platformFilter, genreFilter, sortMode, popularityRank])

  const displayGames = filteredGames.slice(0, 6)
  const featuredGame = displayGames[0]
  const showSkeletons = isLoading && games.length === 0
  const totalGames = filteredGames.length
  const pcCount = filteredGames.filter((game) => game.platform.includes('Windows')).length
  const browserCount = filteredGames.filter((game) => game.platform.includes('Browser')).length
  const newestRelease = getNewestRelease(filteredGames)
  const yearRange = getYearRange(filteredGames)
  const releaseYear = featuredGame ? getReleaseYear(featuredGame.release_date) : null
  const popularityRankValue = featuredGame
    ? popularityRank.get(featuredGame.id)
    : null
  const popularityPercent =
    popularityRankValue !== null && popularityGames.length > 1
      ? Math.round(
          (1 - popularityRankValue / (popularityGames.length - 1)) * 100,
        )
      : null
  const recencyPercent =
    yearRange && releaseYear !== null && yearRange.max !== yearRange.min
      ? Math.round(
          ((releaseYear - yearRange.min) / (yearRange.max - yearRange.min)) * 100,
        )
      : null
  const platformLabel = platformLabels[platformFilter]
  const sortLabel = sortLabels[sortMode]
  const genreLabel = genreFilter === 'all' ? 'All genres' : genreFilter
  const localTime = formatTime(new Date())

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="presentation">
              <path
                d="M4 6h6v6H4V6zm10 0h6v6h-6V6zM4 14h6v6H4v-6zm10 4h6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
          </div>
          <div>
            <div className="brand-title">BCRL</div>
            <div className="brand-sub">VER PTK L00B</div>
          </div>
        </div>
        <nav className="topnav" aria-label="Primary">
          <button className="topnav-item active" type="button">
            Brief
          </button>
          <button className="topnav-item" type="button">
            Unit Map
          </button>
          <button className="topnav-item" type="button">
            Setup
          </button>
        </nav>
        <div className="topbar-right">
          <div className="pill">
            <span className="dot" aria-hidden="true"></span>Global Index
          </div>
          <div className="time">{localTime}</div>
        </div>
      </header>

      <div className="app-body">
        <aside className="rail" aria-label="Section navigation">
          <button className="rail-btn active" type="button" aria-label="Overview">
            <svg viewBox="0 0 24 24" role="presentation">
              <path
                d="M4 4h7v7H4V4zm9 0h7v4h-7V4zm0 6h7v10h-7V10zM4 13h7v7H4v-7z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
          </button>
          <button className="rail-btn" type="button" aria-label="Intel">
            <svg viewBox="0 0 24 24" role="presentation">
              <path
                d="M12 4v4m0 8v4M4 12h4m8 0h4M7.5 7.5l3 3m3 3l3 3m0-9l-3 3m-3 3l-3 3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
          </button>
          <button className="rail-btn" type="button" aria-label="Operations">
            <svg viewBox="0 0 24 24" role="presentation">
              <path
                d="M4 7h16M4 12h10M4 17h16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
          </button>
          <button className="rail-btn" type="button" aria-label="Logs">
            <svg viewBox="0 0 24 24" role="presentation">
              <path
                d="M5 4h10l4 4v12H5V4zm10 0v4h4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
          </button>
          <button className="rail-btn" type="button" aria-label="Users">
            <svg viewBox="0 0 24 24" role="presentation">
              <path
                d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-7 8a7 7 0 0 1 14 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
          </button>
          <div className="rail-divider" aria-hidden="true"></div>
          <button className="rail-btn" type="button" aria-label="Settings">
            <svg viewBox="0 0 24 24" role="presentation">
              <path
                d="M10.5 4h3l1 2 2.2.8-.2 2.2 1.6 2-1.6 2 .2 2.2-2.2.8-1 2h-3l-1-2-2.2-.8.2-2.2-1.6-2 1.6-2-.2-2.2 2.2-.8 1-2zm1.5 6.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
          </button>
        </aside>

        <main className="main">
          <section className="board">
            <div className="spotlight-panel">
              <div className="spotlight-header">
                <div>
                  <div className="panel-eyebrow">Featured Game</div>
                  <div className="panel-title">Spotlight Preview</div>
                </div>
                <div className="spotlight-tabs" role="tablist">
                  <button
                    className={`spotlight-tab ${platformFilter === 'all' ? 'active' : ''}`}
                    type="button"
                    role="tab"
                    onClick={() => setPlatformFilter('all')}
                  >
                    All
                  </button>
                  <button
                    className={`spotlight-tab ${platformFilter === 'pc' ? 'active' : ''}`}
                    type="button"
                    role="tab"
                    onClick={() => setPlatformFilter('pc')}
                  >
                    PC
                  </button>
                  <button
                    className={`spotlight-tab ${platformFilter === 'browser' ? 'active' : ''}`}
                    type="button"
                    role="tab"
                    onClick={() => setPlatformFilter('browser')}
                  >
                    Browser
                  </button>
                </div>
              </div>
              <div
                className={`spotlight-canvas ${featuredGame?.thumbnail ? 'cover' : ''}`}
                style={
                  featuredGame?.thumbnail
                    ? ({ ['--cover' as string]: `url(${featuredGame.thumbnail})` } as CSSProperties)
                    : undefined
                }
              >
                <div className="spotlight-grid" aria-hidden="true"></div>
                <div className="spotlight-lines" aria-hidden="true"></div>
                <article className="spotlight-card">
                  <div className="spotlight-card-header">
                    <span className={`status-chip ${featuredGame ? 'featured' : 'standby'}`}>
                      {featuredGame ? 'featured' : 'standby'}
                    </span>
                    <span className="unit-code">
                      {featuredGame ? formatCode(featuredGame.id) : 'GX-0000'}
                    </span>
                    <button className="icon-button" type="button" aria-label="Open game details">
                      <svg viewBox="0 0 24 24" role="presentation">
                        <path
                          d="M7 17h10V7m0 0H9m8 0-9 9"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.4"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="spotlight-card-title">
                    {featuredGame ? featuredGame.title : 'No featured title'}
                  </div>
                  <p className="spotlight-card-desc">
                    {featuredGame
                      ? featuredGame.short_description
                      : 'No featured title is available from the current feed.'}
                  </p>
                  <div className="spotlight-card-meta">
                    <div>
                      <span className="meta-label">Genre</span>
                      <span className="meta-value">
                        {featuredGame ? featuredGame.genre : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="meta-label">Platform</span>
                      <span className="meta-value">
                        {featuredGame ? formatPlatform(featuredGame.platform) : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="meta-label">Release</span>
                      <span className="meta-value">
                        {featuredGame ? featuredGame.release_date : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="spotlight-card-meters">
                    <div className="meter-row">
                      <span>Popularity</span>
                      <div className="meter">
                        <div
                          className="meter-fill"
                          style={{ width: `${popularityPercent ?? 0}%` }}
                        ></div>
                      </div>
                      <span className="meter-value">
                        {popularityPercent !== null ? `${popularityPercent}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="meter-row">
                      <span>Recency</span>
                      <div className="meter">
                        <div
                          className="meter-fill alt"
                          style={{ width: `${recencyPercent ?? 0}%` }}
                        ></div>
                      </div>
                      <span className="meter-value">
                        {recencyPercent !== null ? `${recencyPercent}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="spotlight-card-footer">
                    <span className="chip-sub">
                      {featuredGame
                        ? `Publisher: ${featuredGame.publisher} / Developer: ${featuredGame.developer}`
                        : 'Publisher and developer data unavailable.'}
                    </span>
                  </div>
                </article>
              </div>
            </div>

            <aside className="intel-panel">
              <div className="intel-header">
                <div>
                  <div className="panel-eyebrow">Telemetry</div>
                  <div className="panel-title">Live Network</div>
                </div>
                <button className="ghost-button" type="button">
                  Scan
                </button>
              </div>
              <div className="intel-metrics">
                <div className="intel-metric">
                  <span>Titles in View</span>
                  <strong>{formatCount(totalGames)}</strong>
                </div>
                <div className="intel-metric">
                  <span>PC Titles</span>
                  <strong>{formatCount(pcCount)}</strong>
                </div>
                <div className="intel-metric">
                  <span>Browser Titles</span>
                  <strong>{formatCount(browserCount)}</strong>
                </div>
              </div>
              <div className="intel-bars" aria-hidden="true">
                <span style={{ height: '42%' }}></span>
                <span style={{ height: '58%' }}></span>
                <span style={{ height: '74%' }}></span>
                <span style={{ height: '36%' }}></span>
                <span style={{ height: '62%' }}></span>
                <span style={{ height: '48%' }}></span>
              </div>
              <div className="intel-feed">
                <div className="feed-line">
                  <span className="feed-dot" aria-hidden="true"></span>
                  Showing {displayGames.length} of {formatCount(totalGames)} titles.
                </div>
                <div className="feed-line">
                  <span className="feed-dot" aria-hidden="true"></span>
                  Platform: {platformLabel} / Genre: {genreLabel}.
                </div>
                <div className="feed-line">
                  <span className="feed-dot" aria-hidden="true"></span>
                  Sort: {sortLabel} / Newest: {newestRelease ? `${newestRelease.title} (${newestRelease.release_date})` : 'N/A'}.
                </div>
              </div>
            </aside>
          </section>

          <section className="list-panel">
            <div className="list-header">
              <div>
                <div className="panel-eyebrow">Game List</div>
                <h2>Live Game Grid</h2>
              </div>
              <div className="list-tabs" role="tablist">
                <button
                  className={`list-tab ${sortMode === 'popularity' ? 'active' : ''}`}
                  type="button"
                  role="tab"
                  onClick={() => setSortMode('popularity')}
                >
                  Popular
                </button>
                <button
                  className={`list-tab ${sortMode === 'release-date' ? 'active' : ''}`}
                  type="button"
                  role="tab"
                  onClick={() => setSortMode('release-date')}
                >
                  Newest
                </button>
                <button
                  className={`list-tab ${sortMode === 'alphabetical' ? 'active' : ''}`}
                  type="button"
                  role="tab"
                  onClick={() => setSortMode('alphabetical')}
                >
                  A-Z
                </button>
                <button
                  className={`list-tab ${sortMode === 'relevance' ? 'active' : ''}`}
                  type="button"
                  role="tab"
                  onClick={() => setSortMode('relevance')}
                >
                  Relevance
                </button>
              </div>
              <label className="filter-select">
                <span>Genre</span>
                <select
                  value={genreFilter}
                  onChange={(event) => setGenreFilter(event.target.value)}
                  aria-label="Filter by genre"
                >
                  <option value="all">All genres</option>
                  {genreOptions.map((genre) => (
                    <option value={genre} key={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {isError && (
              <div className="error-banner">
                Signal lost. Unable to load live game data.
              </div>
            )}

            <div className="game-grid">
              {showSkeletons &&
                Array.from({ length: 6 }).map((_, index) => (
                  <div className="game-card skeleton" key={`skeleton-${index}`}>
                    <div className="skeleton-thumb"></div>
                    <div className="skeleton-body">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                ))}
              {!showSkeletons &&
                displayGames.map((game) => {
                  const releaseYear = getReleaseYear(game.release_date)
                  const releaseTier = getReleaseTier(releaseYear)
                  const releaseLabel = releaseYear ? String(releaseYear) : 'TBA'

                  return (
                    <article className="game-card" key={game.id}>
                      <div className="game-card-top">
                        {game.thumbnail ? (
                          <img src={game.thumbnail} alt={game.title} loading="lazy" />
                        ) : (
                          <div className="thumb-placeholder" aria-hidden="true"></div>
                        )}
                        <span className={`release-pill ${releaseTier}`}>
                          {releaseLabel}
                        </span>
                        <span className="corner-tag">{game.genre}</span>
                      </div>
                      <div className="game-card-body">
                        <div className="game-title">{game.title}</div>
                        <div className="game-sub">{game.publisher}</div>
                        <div className="game-meta">
                          <span>{formatPlatform(game.platform)}</span>
                          <span>{game.release_date}</span>
                        </div>
                      </div>
                    </article>
                  )
                })}
              {!showSkeletons && displayGames.length === 0 && (
                <div className="empty-state">No game data available.</div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
