import type { GameDetails } from '../types/game'
import { formatPlatform, getReleaseYear } from '../utility/homeUtils'

type MainCardProps = {
	game: GameDetails | null
	allGamesReleaseYearsSource: { release_date: string }[]
	popularityRank: Map<number, number>
	popularityCount: number
	isLoading: boolean
	isError: boolean
}

function MainCard({
	game,
	allGamesReleaseYearsSource,
	popularityRank,
	popularityCount,
	isLoading,
	isError,
}: MainCardProps) {
	const releaseYear = game ? getReleaseYear(game.release_date) : null
	const releaseYears = allGamesReleaseYearsSource
		.map((sourceGame) => getReleaseYear(sourceGame.release_date))
		.filter((year): year is number => year !== null)
	const yearRange =
		releaseYears.length > 0
			? { min: Math.min(...releaseYears), max: Math.max(...releaseYears) }
			: null
	const popularityRankValue = game ? (popularityRank.get(game.id) ?? null) : null
	const popularityPercent =
		popularityRankValue !== null && popularityCount > 1
			? Math.round((1 - popularityRankValue / (popularityCount - 1)) * 100)
			: null
	const recencyPercent =
		yearRange && releaseYear !== null && yearRange.max !== yearRange.min
			? Math.round(((releaseYear - yearRange.min) / (yearRange.max - yearRange.min)) * 100)
			: null

	const requirement = game?.minimum_system_requirements

	return (
		<section className="board">
			<div className="spotlight-panel selected-preview-panel">
				<div className="spotlight-header">
					<div>
						<div className="panel-eyebrow">Selected Game</div>
						<div className="panel-title">Selected Game Preview</div>
					</div>
				</div>

				{isError && <div className="error-banner">Signal lost. Unable to load game details.</div>}

				<div className="selected-preview-frame">
					{game?.thumbnail ? (
						<img src={game.thumbnail} alt={game.title} className="selected-preview-image" />
					) : (
						<div className="thumb-placeholder" aria-hidden="true"></div>
					)}
					<div className="selected-preview-overlay" aria-hidden="true"></div>
					<div className="selected-preview-content">
						<h2>{game ? game.title : isLoading ? 'Loading game...' : 'Game not found'}</h2>
						<h3>
							{game
								? game.short_description
								: 'No selected game information is available for this request.'}
						</h3>
					</div>
				</div>
			</div>

			<aside className="intel-panel game-overview-panel">
				<div className="intel-header">
					<div>
						<div className="panel-eyebrow">Telemetry</div>
						<div className="panel-title">Game Overview</div>
					</div>
				</div>

				<div className="intel-metrics">
					<div className="intel-metric">
						<span>Genre</span>
						<strong>{game?.genre ?? 'N/A'}</strong>
					</div>
					<div className="intel-metric">
						<span>Platform</span>
						<strong>{game ? formatPlatform(game.platform) : 'N/A'}</strong>
					</div>
					<div className="intel-metric">
						<span>Specs</span>
						<strong>{requirement ? 'Available' : 'Not listed'}</strong>
					</div>
					<div className="intel-metric">
						<span>Popularity</span>
						<strong>{popularityPercent !== null ? `${popularityPercent}%` : 'N/A'}</strong>
					</div>
					<div className="intel-metric">
						<span>Recency</span>
						<strong>{recencyPercent !== null ? `${recencyPercent}%` : 'N/A'}</strong>
					</div>
				</div>

				<div className="intel-feed">
					<div className="feed-line">
						<span className="feed-dot" aria-hidden="true"></span>
						OS: {requirement?.os ?? 'N/A'}
					</div>
					<div className="feed-line">
						<span className="feed-dot" aria-hidden="true"></span>
						CPU: {requirement?.processor ?? 'N/A'}
					</div>
					<div className="feed-line">
						<span className="feed-dot" aria-hidden="true"></span>
						Memory: {requirement?.memory ?? 'N/A'} / GPU: {requirement?.graphics ?? 'N/A'}
					</div>
					<div className="feed-line">
						<span className="feed-dot" aria-hidden="true"></span>
						Storage: {requirement?.storage ?? 'N/A'}
					</div>
				</div>
			</aside>
		</section>
	)
}

export default MainCard
