import { useEffect, useMemo, useState } from 'react'
import '../App.css'
import GameCards from '../components/GameCards'
import Navbar from '../components/Navbar'
import Pagination from '../components/Pagination'
import { useGetGamesQuery, useGetGamesSortedQuery } from '../rtk/gameApi'
import type { GameSortBy } from '../types/game'
import {
	formatCount,
	formatTime,
	getReleaseYear,
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

function PickAGame() {
	const { data: games = [], isLoading, isError } = useGetGamesQuery()
	const { data: popularityGames = [] } = useGetGamesSortedQuery('popularity')

	const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all')
	const [genreFilter, setGenreFilter] = useState('all')
	const [sortMode, setSortMode] = useState<GameSortBy>('popularity')
	const [searchTerm, setSearchTerm] = useState('')
	const [publisherFilter, setPublisherFilter] = useState('all')
	const [fromYear, setFromYear] = useState('all')
	const [toYear, setToYear] = useState('all')
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

	const popularityRank = useMemo(() => {
		const ranks = new Map<number, number>()
		popularityGames.forEach((game, index) => {
			ranks.set(game.id, index)
		})
		return ranks
	}, [popularityGames])

	const genreOptions = useMemo(() => {
		const uniqueGenres = new Set<string>()
		games.forEach((game) => {
			if (game.genre) {
				uniqueGenres.add(game.genre)
			}
		})
		return [...uniqueGenres].sort((a, b) => a.localeCompare(b))
	}, [games])

	const publisherOptions = useMemo(() => {
		const counts = new Map<string, number>()
		games.forEach((game) => {
			if (!game.publisher) {
				return
			}
			counts.set(game.publisher, (counts.get(game.publisher) ?? 0) + 1)
		})

		return [...counts.entries()]
			.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
			.slice(0, 12)
			.map(([publisher]) => publisher)
	}, [games])

	const releaseYearOptions = useMemo(() => {
		const years = new Set<number>()
		games.forEach((game) => {
			const releaseYear = getReleaseYear(game.release_date)
			if (releaseYear !== null) {
				years.add(releaseYear)
			}
		})

		return [...years].sort((a, b) => b - a)
	}, [games])

	const filteredGames = useMemo(() => {
		const loweredQuery = searchTerm.trim().toLowerCase()
		const fromYearValue = fromYear === 'all' ? null : Number(fromYear)
		const toYearValue = toYear === 'all' ? null : Number(toYear)

		const baseFiltered = games.filter((game) => {
			if (!matchesPlatform(game, platformFilter)) {
				return false
			}

			if (genreFilter !== 'all' && game.genre !== genreFilter) {
				return false
			}

			if (publisherFilter !== 'all' && game.publisher !== publisherFilter) {
				return false
			}

			const releaseYear = getReleaseYear(game.release_date)
			if (fromYearValue !== null && (releaseYear === null || releaseYear < fromYearValue)) {
				return false
			}

			if (toYearValue !== null && (releaseYear === null || releaseYear > toYearValue)) {
				return false
			}

			if (!loweredQuery) {
				return true
			}

			return (
				game.title.toLowerCase().includes(loweredQuery) ||
				game.genre.toLowerCase().includes(loweredQuery) ||
				game.publisher.toLowerCase().includes(loweredQuery) ||
				game.short_description.toLowerCase().includes(loweredQuery)
			)
		})

		return sortGames(baseFiltered, sortMode, popularityRank)
	}, [
		games,
		platformFilter,
		genreFilter,
		publisherFilter,
		searchTerm,
		fromYear,
		toYear,
		sortMode,
		popularityRank,
	])

	const totalPages = Math.max(1, Math.ceil(filteredGames.length / pageSize))
	const safeCurrentPage = Math.min(currentPage, totalPages)
	const pageStart = (safeCurrentPage - 1) * pageSize
	const pageGames = filteredGames.slice(pageStart, pageStart + pageSize)
	const showSkeletons = isLoading && games.length === 0
	const localTime = formatTime(new Date())

	const clearFilters = () => {
		setPlatformFilter('all')
		setGenreFilter('all')
		setPublisherFilter('all')
		setFromYear('all')
		setToYear('all')
		setSortMode('popularity')
		setSearchTerm('')
	}

	return (
		<div className="app-shell">
			<Navbar variant="top" localTime={localTime} />

			<div className="app-body">
				<Navbar variant="side" />

				<main className="main">
					<section className="list-panel picker-control-panel">
						<div className="list-header picker-header">
							<div>
								<div className="panel-eyebrow">Game Picker</div>
								<h2>Targeted Discovery</h2>
							</div>
							<div className="picker-summary">
								<span>
									{formatCount(filteredGames.length)} matches / Platform:{' '}
									{platformLabels[platformFilter]} / Sort: {sortLabels[sortMode]}
								</span>
								<button className="ghost-button" type="button" onClick={clearFilters}>
									Reset
								</button>
							</div>
						</div>

						<div className="picker-controls" role="group" aria-label="Game filters">
							<label className="picker-control picker-control--wide">
								<span>Search</span>
								<input
									type="search"
									placeholder="Search title, genre, publisher..."
									value={searchTerm}
									onChange={(event) => {
										setSearchTerm(event.target.value)
										setCurrentPage(1)
									}}
								/>
							</label>

							<label className="picker-control">
								<span>Platform</span>
								<select
									value={platformFilter}
									onChange={(event) => {
										setPlatformFilter(event.target.value as PlatformFilter)
										setCurrentPage(1)
									}}
								>
									<option value="all">All</option>
									<option value="pc">PC</option>
									<option value="browser">Browser</option>
								</select>
							</label>

							<label className="picker-control">
								<span>Genre</span>
								<select
									value={genreFilter}
									onChange={(event) => {
										setGenreFilter(event.target.value)
										setCurrentPage(1)
									}}
								>
									<option value="all">All genres</option>
									{genreOptions.map((genre) => (
										<option key={genre} value={genre}>
											{genre}
										</option>
									))}
								</select>
							</label>

							<label className="picker-control">
								<span>Publisher</span>
								<select
									value={publisherFilter}
									onChange={(event) => {
										setPublisherFilter(event.target.value)
										setCurrentPage(1)
									}}
								>
									<option value="all">All publishers</option>
									{publisherOptions.map((publisher) => (
										<option key={publisher} value={publisher}>
											{publisher}
										</option>
									))}
								</select>
							</label>

							<label className="picker-control">
								<span>Released From</span>
								<select
									value={fromYear}
									onChange={(event) => {
										setFromYear(event.target.value)
										setCurrentPage(1)
									}}
								>
									<option value="all">Any</option>
									{releaseYearOptions.map((year) => (
										<option key={year} value={year}>
											{year}
										</option>
									))}
								</select>
							</label>

							<label className="picker-control">
								<span>Released To</span>
								<select
									value={toYear}
									onChange={(event) => {
										setToYear(event.target.value)
										setCurrentPage(1)
									}}
								>
									<option value="all">Any</option>
									{releaseYearOptions.map((year) => (
										<option key={year} value={year}>
											{year}
										</option>
									))}
								</select>
							</label>

							<label className="picker-control">
								<span>Sort</span>
								<select
									value={sortMode}
									onChange={(event) => {
										setSortMode(event.target.value as GameSortBy)
										setCurrentPage(1)
									}}
								>
									<option value="popularity">Popular</option>
									<option value="release-date">Newest</option>
									<option value="alphabetical">A-Z</option>
									<option value="relevance">Relevance</option>
								</select>
							</label>
						</div>
					</section>

					<section className="list-panel">
						{isError && (
							<div className="error-banner">Signal lost. Unable to load live game data.</div>
						)}

						<div className="game-grid">
							{showSkeletons &&
								Array.from({ length: pageSize }).map((_, index) => (
									<div className="game-card skeleton" key={`picker-skeleton-${index}`}>
										<div className="skeleton-thumb"></div>
										<div className="skeleton-body">
											<span></span>
											<span></span>
											<span></span>
										</div>
									</div>
								))}

							{!showSkeletons && pageGames.map((game) => <GameCards key={game.id} game={game} />)}

							{!showSkeletons && pageGames.length === 0 && (
								<div className="empty-state">No games matched your filter criteria.</div>
							)}
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

export default PickAGame
