import { useEffect, useMemo, useState } from 'react'
import '../App.css'
import GameCardGrid from '../components/GameCardGrid'
import FeaturedCard from '../components/FeaturedCard'
import Navbar from '../components/Navbar'
import { useGetGamesQuery, useGetGamesSortedQuery } from '../rtk/gameApi'
import type { GameSortBy } from '../types/game'
import {
  formatCount,
  formatTime,
  getNewestRelease,
  getReleaseYear,
  getYearRange,
  matchesPlatform,
  platformLabels,
  sortGames,
  sortLabels,
  type PlatformFilter,
} from '../utility/homeUtils'

const PHONE_MAX_WIDTH = 720
const LAPTOP_MIN_WIDTH = 1200

const getPageSizeForViewport = () => {
  if (typeof window === 'undefined') {
    return 9
  }

  if (window.innerWidth <= PHONE_MAX_WIDTH) {
    return 6
  }

  if (window.innerWidth < LAPTOP_MIN_WIDTH) {
    return 10
  }

  return 9
}

function Home() {
  const { data: games = [], isLoading, isError } = useGetGamesQuery()
  const { data: popularityGames = [] } = useGetGamesSortedQuery('popularity')
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all')
  const [sortMode, setSortMode] = useState<GameSortBy>('popularity')
  const [genreFilter, setGenreFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(getPageSizeForViewport)

  useEffect(() => {
    const handleResize = () => {
      setPageSize(getPageSizeForViewport())
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handlePlatformFilterChange = (platform: PlatformFilter) => {
    setPlatformFilter(platform)
    setCurrentPage(1)
  }

  const handleSortModeChange = (sortBy: GameSortBy) => {
    setSortMode(sortBy)
    setCurrentPage(1)
  }

  const handleGenreFilterChange = (genre: string) => {
    setGenreFilter(genre)
    setCurrentPage(1)
  }

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

  const totalPages = Math.max(1, Math.ceil(filteredGames.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const pageStart = (safeCurrentPage - 1) * pageSize
  const pageGames = filteredGames.slice(pageStart, pageStart + pageSize)

  const featuredGame = pageGames[0]
  const showSkeletons = isLoading && games.length === 0
  const totalGames = filteredGames.length
  const pcCount = filteredGames.filter((game) => game.platform.includes('Windows')).length
  const browserCount = filteredGames.filter((game) => game.platform.includes('Browser')).length
  const newestRelease = getNewestRelease(filteredGames)
  const yearRange = getYearRange(filteredGames)
  const releaseYear = featuredGame ? getReleaseYear(featuredGame.release_date) : null
  const popularityRankValue = featuredGame
    ? (popularityRank.get(featuredGame.id) ?? null)
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
      <Navbar variant="top" localTime={localTime} />

      <div className="app-body">
        <Navbar variant="side" />

        <main className="main">
          <section className="board">
            <FeaturedCard
              featuredGame={featuredGame}
              platformFilter={platformFilter}
              onPlatformFilterChange={handlePlatformFilterChange}
              popularityPercent={popularityPercent}
              recencyPercent={recencyPercent}
            />

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
                  Showing {pageGames.length} of {formatCount(totalGames)} titles.
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

          <GameCardGrid
            sortMode={sortMode}
            onSortModeChange={handleSortModeChange}
            genreFilter={genreFilter}
            onGenreFilterChange={handleGenreFilterChange}
            genreOptions={genreOptions}
            isError={isError}
            isLoading={showSkeletons}
            games={pageGames}
            pageSize={pageSize}
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </main>
      </div>
    </div>
  )
}

export default Home
