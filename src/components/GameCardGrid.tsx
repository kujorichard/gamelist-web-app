import type { GameSortBy, GameSummary } from '../types/game'
import GameCards from './GameCards'
import Pagination from './Pagination'

type GameCardGridProps = {
	sortMode: GameSortBy
	onSortModeChange: (sortBy: GameSortBy) => void
	genreFilter: string
	onGenreFilterChange: (genre: string) => void
	genreOptions: string[]
	isError: boolean
	isLoading: boolean
	games: GameSummary[]
	pageSize: number
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
}

function GameCardGrid({
	sortMode,
	onSortModeChange,
	genreFilter,
	onGenreFilterChange,
	genreOptions,
	isError,
	isLoading,
	games,
	pageSize,
	currentPage,
	totalPages,
	onPageChange,
}: GameCardGridProps) {
	const showSkeletons = isLoading && games.length === 0

	return (
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
						onClick={() => onSortModeChange('popularity')}
					>
						Popular
					</button>
					<button
						className={`list-tab ${sortMode === 'release-date' ? 'active' : ''}`}
						type="button"
						role="tab"
						onClick={() => onSortModeChange('release-date')}
					>
						Newest
					</button>
					<button
						className={`list-tab ${sortMode === 'alphabetical' ? 'active' : ''}`}
						type="button"
						role="tab"
						onClick={() => onSortModeChange('alphabetical')}
					>
						A-Z
					</button>
					<button
						className={`list-tab ${sortMode === 'relevance' ? 'active' : ''}`}
						type="button"
						role="tab"
						onClick={() => onSortModeChange('relevance')}
					>
						Relevance
					</button>
				</div>
				<label className="filter-select">
					<span>Genre</span>
					<select
						value={genreFilter}
						onChange={(event) => onGenreFilterChange(event.target.value)}
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
					Array.from({ length: pageSize }).map((_, index) => (
						<div className="game-card skeleton" key={`skeleton-${index}`}>
							<div className="skeleton-thumb"></div>
							<div className="skeleton-body">
								<span></span>
								<span></span>
								<span></span>
							</div>
						</div>
					))}
				{!showSkeletons && games.map((game) => <GameCards key={game.id} game={game} />)}
				{!showSkeletons && games.length === 0 && (
					<div className="empty-state">No game data available.</div>
				)}
			</div>

			<div className="list-footer">
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={onPageChange}
				/>
			</div>
		</section>
	)
}

export default GameCardGrid
