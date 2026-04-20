import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetGamesQuery, useGetGamesSortedQuery } from '../rtk/gameApi'
import type { GameSummary } from '../types/game'
import { formatPlatform, getReleaseTier, getReleaseYear } from '../utility/homeUtils'
import Pagination from '../components/Pagination'
import '../styles/Charts.css'
import Navbar from '../components/Navbar'
import ChartCardSkeleton from '../components/ChartCardSkeleton'

type ChartMode = 'newest' | 'popular' | 'newest:popular' | 'popular:newest'

type ScoredGame = {
  game: GameSummary
  newestPercent: number
  popularPercent: number
}

const CHART_VIEWBOX = {
  width: 1000,
  height: 420,
  leftPadding: 52,
  rightPadding: 24,
  topPadding: 24,
  bottomPadding: 130,
}

const chartModeLabels: Record<ChartMode, string> = {
  newest: 'Newest',
  popular: 'Popular',
  'newest:popular': 'Newest:Popular',
  'popular:newest': 'Popular:Newest',
}

const statusLabelByTier: Record<string, string> = {
  recent: 'Hot',
  established: 'Stable',
  legacy: 'Legacy',
  unknown: 'Unknown',
}

const isDualLineMode = (mode: ChartMode) =>
  mode === 'newest:popular' || mode === 'popular:newest'

const toPercentFromRank = (rank: number | undefined, total: number) => {
  if (total <= 1) {
    return 100
  }
  if (rank === undefined) {
    return 0
  }

  return Math.round((1 - rank / (total - 1)) * 100)
}

const Charts = () => {
  const navigate = useNavigate()
  const { data: allGames = [] } = useGetGamesQuery()

  const { data: newestGames = [], isLoading: newestLoading, error: newestError } =
    useGetGamesSortedQuery('release-date')
  const { data: popularGames = [], isLoading: popularLoading, error: popularError } =
    useGetGamesSortedQuery('popularity')

  const [currentPage, setCurrentPage] = useState(1)
  const [chartMode, setChartMode] = useState<ChartMode>('newest')
  const [genreFilter, setGenreFilter] = useState('all')
  const [highlightedGameId, setHighlightedGameId] = useState<number | null>(null)
  const PAGE_SIZE = 15
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sourceGames = allGames.length > 0 ? allGames : newestGames

  const genreOptions = useMemo(() => {
    const genres = new Set<string>()

    sourceGames.forEach((game) => {
      if (game.genre) {
        genres.add(game.genre)
      }
    })

    return [...genres].sort((a, b) => a.localeCompare(b))
  }, [sourceGames])

  const newestRank = useMemo(() => {
    const ranks = new Map<number, number>()
    newestGames.forEach((game, index) => {
      ranks.set(game.id, index)
    })
    return ranks
  }, [newestGames])

  const popularRank = useMemo(() => {
    const ranks = new Map<number, number>()
    popularGames.forEach((game, index) => {
      ranks.set(game.id, index)
    })
    return ranks
  }, [popularGames])

  const filteredGames = useMemo(() => {
    if (genreFilter === 'all') {
      return sourceGames
    }

    return sourceGames.filter((game) => game.genre === genreFilter)
  }, [sourceGames, genreFilter])

  const scoredGames = useMemo(() => {
    return filteredGames
      .map<ScoredGame>((game) => {
        const newestPercent = toPercentFromRank(newestRank.get(game.id), newestGames.length)
        const popularPercent = toPercentFromRank(popularRank.get(game.id), popularGames.length)

        return {
          game,
          newestPercent,
          popularPercent,
        }
      })
      .sort((a, b) => {
        if (chartMode === 'newest') {
          if (b.newestPercent !== a.newestPercent) {
            return b.newestPercent - a.newestPercent
          }
          return a.game.title.localeCompare(b.game.title)
        }

        if (chartMode === 'popular') {
          if (b.popularPercent !== a.popularPercent) {
            return b.popularPercent - a.popularPercent
          }
          return a.game.title.localeCompare(b.game.title)
        }

        if (chartMode === 'newest:popular') {
          if (b.newestPercent !== a.newestPercent) {
            return b.newestPercent - a.newestPercent
          }
          if (b.popularPercent !== a.popularPercent) {
            return b.popularPercent - a.popularPercent
          }
          return a.game.title.localeCompare(b.game.title)
        }

        if (b.popularPercent !== a.popularPercent) {
          return b.popularPercent - a.popularPercent
        }
        if (b.newestPercent !== a.newestPercent) {
          return b.newestPercent - a.newestPercent
        }
        return a.game.title.localeCompare(b.game.title)
      })
  }, [filteredGames, newestRank, newestGames.length, popularRank, popularGames.length, chartMode])

  const totalPages = Math.max(1, Math.ceil(scoredGames.length / PAGE_SIZE))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const start = (safeCurrentPage - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE

  const paginatedScoredGames = scoredGames.slice(start, end)
  const isLoading = newestLoading || popularLoading
  const error = newestError || popularError

  const chartPointData = useMemo(() => {
    if (paginatedScoredGames.length === 0) {
      return []
    }

    const { width: viewWidth, height: viewHeight, leftPadding, rightPadding, topPadding, bottomPadding } =
      CHART_VIEWBOX
    const chartWidth = viewWidth - leftPadding - rightPadding
    const chartHeight = viewHeight - topPadding - bottomPadding

    return paginatedScoredGames.map((entry, index) => {
      const x =
        paginatedScoredGames.length === 1
          ? leftPadding + chartWidth / 2
          : leftPadding + (index / (paginatedScoredGames.length - 1)) * chartWidth

      const primaryPercent = chartMode === 'popular' || chartMode === 'popular:newest'
        ? entry.popularPercent
        : entry.newestPercent
      const secondaryPercent = isDualLineMode(chartMode)
        ? chartMode === 'popular:newest'
          ? entry.newestPercent
          : entry.popularPercent
        : null
      const primaryY = topPadding + ((100 - primaryPercent) / 100) * chartHeight
      const secondaryY =
        secondaryPercent === null
          ? null
          : topPadding + ((100 - secondaryPercent) / 100) * chartHeight

      return {
        ...entry,
        x,
        primaryPercent,
        secondaryPercent,
        primaryY,
        secondaryY,
      }
    })
  }, [paginatedScoredGames, chartMode])

  const primaryLinePoints = chartPointData.map((point) => `${point.x},${point.primaryY}`).join(' ')
  const secondaryLinePoints = chartPointData
    .filter((point) => point.secondaryY !== null)
    .map((point) => `${point.x},${point.secondaryY}`)
    .join(' ')

  const openDetails = (id: number) => {
    navigate(`/game/${id}`)
  }

  const handleAxisLabelClick = (gameId: number) => {
    const target = document.getElementById(`chart-game-${gameId}`)

    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }

    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current)
    }

    setHighlightedGameId(gameId)
    highlightTimerRef.current = setTimeout(() => {
      setHighlightedGameId((current) => (current === gameId ? null : current))
      highlightTimerRef.current = null
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="app-shell">
      <Navbar variant="top" />

      <div className="app-body">
        <Navbar variant="side" />

        <main className="main">
          <section className="list-panel charts-graph-panel">
            <div className="list-header charts-header">
              <div>
                <div className="panel-eyebrow">Visualization</div>
                <h2>Top 15 Rating Graph</h2>
              </div>
              <div className="list-tabs" role="tablist" aria-label="Chart mode">
                {(Object.keys(chartModeLabels) as ChartMode[]).map((mode) => (
                  <button
                    key={mode}
                    className={`list-tab ${chartMode === mode ? 'active' : ''}`}
                    type="button"
                    role="tab"
                    onClick={() => {
                      setChartMode(mode)
                      setCurrentPage(1)
                    }}
                  >
                    {chartModeLabels[mode]}
                  </button>
                ))}
              </div>
              <label className="filter-select">
                <span>Genre</span>
                <select
                  value={genreFilter}
                  onChange={(event) => {
                    setGenreFilter(event.target.value)
                    setCurrentPage(1)
                  }}
                  aria-label="Filter chart by genre"
                >
                  <option value="all">All genres</option>
                  {genreOptions.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="chart-mode-summary">
              <span>Mode: {chartModeLabels[chartMode]}</span>
              <span>
                Showing {paginatedScoredGames.length} of {scoredGames.length} ranked titles on page{' '}
                {safeCurrentPage}.
              </span>
            </div>

            <div className="chart-graph" aria-label="Top fifteen game score graph">
              {!isLoading && chartPointData.length > 0 && (
                <div className="chart-line-wrap">
                  <svg
                    className="chart-line-svg"
                    viewBox={`0 0 ${CHART_VIEWBOX.width} ${CHART_VIEWBOX.height}`}
                    role="img"
                    aria-label="Line graph of current page game scores"
                  >
                    {[0, 25, 50, 75, 100].map((tick) => {
                      const chartHeight =
                        CHART_VIEWBOX.height - CHART_VIEWBOX.topPadding - CHART_VIEWBOX.bottomPadding
                      const y =
                        CHART_VIEWBOX.topPadding +
                        ((100 - tick) / 100) * chartHeight
                      return (
                        <g key={tick}>
                          <line
                            x1={CHART_VIEWBOX.leftPadding}
                            y1={y}
                            x2={CHART_VIEWBOX.width - CHART_VIEWBOX.rightPadding}
                            y2={y}
                            className="chart-line-grid"
                            aria-hidden="true"
                          />
                          <text x={CHART_VIEWBOX.leftPadding - 8} y={y + 4} className="chart-line-y-label">
                            {tick}
                          </text>
                        </g>
                      )
                    })}

                    <polyline
                      points={primaryLinePoints}
                      fill="none"
                      className="chart-line-stroke-primary"
                    />

                    {isDualLineMode(chartMode) && secondaryLinePoints && (
                      <polyline
                        points={secondaryLinePoints}
                        fill="none"
                        className="chart-line-stroke-secondary"
                      />
                    )}

                    {chartPointData.map((point, index) => (
                      <g key={point.game.id}>
                        <circle
                          cx={point.x}
                          cy={point.primaryY}
                          r="5"
                          className="chart-line-point-primary"
                        />
                        {isDualLineMode(chartMode) && point.secondaryY !== null && (
                          <circle
                            cx={point.x}
                            cy={point.secondaryY}
                            r="5"
                            className="chart-line-point-secondary"
                          />
                        )}
                        <text
                          x={point.x}
                          y={CHART_VIEWBOX.height - 12}
                          className="chart-line-x-label chart-line-x-label-clickable"
                          onClick={() => handleAxisLabelClick(point.game.id)}
                        >
                          {start + index + 1}
                        </text>
                        <title>
                          {`${start + index + 1}. ${point.game.title} - Newest ${point.newestPercent}%, Popular ${point.popularPercent}%`}
                        </title>
                      </g>
                    ))}
                  </svg>

                  {isDualLineMode(chartMode) && (
                    <div className="chart-line-legend" aria-label="Line legend">
                      <span className="legend-item">
                        <span className="legend-swatch legend-swatch-primary" aria-hidden="true"></span>
                        {chartMode === 'popular:newest' ? 'Popular' : 'Newest'}
                      </span>
                      <span className="legend-item">
                        <span className="legend-swatch legend-swatch-secondary" aria-hidden="true"></span>
                        {chartMode === 'popular:newest' ? 'Newest' : 'Popular'}
                      </span>
                    </div>
                  )}

                  <div className="chart-line-caption">
                    X-axis: ranked positions on this page (click to jump to the matching card). Y-axis:
                    rating percent by selected mode.
                  </div>
                </div>
              )}

              {!isLoading && chartPointData.length === 0 && (
                <div className="empty-state">No game data available for this genre filter.</div>
              )}

              {isLoading && (
                <div className="charts-graph-loading">Building graph from ranked data...</div>
              )}
            </div>
          </section>

          <section className="list-panel charts-panel">
            <div className="list-header charts-header">
              <div>
                <div className="panel-eyebrow">Charts</div>
                <h2>Ranked Games List</h2>
              </div>
            </div>

            {error && <div className="error-banner">Failed to load games.</div>}

            <div className="charts-list">
              {isLoading &&
                Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <ChartCardSkeleton key={index} />
                ))}

              {!isLoading &&
                paginatedScoredGames.map((entry, index) => {
                  const game = entry.game
                  const releaseYear = getReleaseYear(game.release_date)
                  const releaseTier = getReleaseTier(releaseYear)
                  const statusLabel = statusLabelByTier[releaseTier] ?? 'Unknown'

                  return (
                  <article
                    key={game.id}
                    id={`chart-game-${game.id}`}
                    className={`chart-card ${highlightedGameId === game.id ? 'is-jumped' : ''}`}
                    onClick={() => openDetails(game.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="card-content">
                      <div className="rank-badge">#{start + index + 1}</div>

                      <div className="card-left">
                        {game.thumbnail ? (
                          <img src={game.thumbnail} alt={game.title} />
                        ) : (
                          <div className="thumb-placeholder" />
                        )}
                      </div>

                      <div className="card-right">
                        <h3 className="header3">{game.title}</h3>
                        <p className="card-publisher">{game.publisher}</p>

                        <div className="game-meta-row">
                          <span className="meta-pill meta-pill--platform">{formatPlatform(game.platform)}</span>
                          {isDualLineMode(chartMode) ? (
                            <span className="meta-pill meta-pill--score">
                              N {entry.newestPercent}% / P {entry.popularPercent}%
                            </span>
                          ) : (
                            <span className="meta-pill meta-pill--score">
                              {chartMode === 'popular' ? entry.popularPercent : entry.newestPercent}%
                            </span>
                          )}
                          <span className="meta-pill">Date {game.release_date}</span>
                          <span className="meta-pill">Status {statusLabel}</span>
                          <span className="meta-pill">Genre {game.genre}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                  )
                })}
            </div>

            <div className="list-footer">
              <Pagination
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default Charts