import type { GameDetails } from '../types/game'
import { formatPlatform } from '../utility/homeUtils'

type GameDescProps = {
	game: GameDetails | null
	isLoading: boolean
	isError: boolean
}

function GameDesc({ game, isLoading, isError }: GameDescProps) {
	const requirement = game?.minimum_system_requirements

	return (
		<section className="list-panel game-desc-panel">
			<div className="list-header game-desc-header">
				<div>
					<div className="panel-eyebrow">Mission Data</div>
					<h2>Complete Game Description</h2>
				</div>
			</div>

			{isError && <div className="error-banner">Unable to load full game description.</div>}

			<div className="game-desc-grid">
				<article className="game-desc-card game-desc-main">
					<h3>Synopsis</h3>
					<p>
						{game
							? game.description
							: isLoading
								? 'Loading game briefing...'
								: 'No description is available for this game.'}
					</p>
				</article>

				<article className="game-desc-card">
					<h3>Publishing Info</h3>
					<ul>
						<li>Publisher: {game?.publisher ?? 'N/A'}</li>
						<li>Developer: {game?.developer ?? 'N/A'}</li>
						<li>Release: {game?.release_date ?? 'N/A'}</li>
						<li>Status: {game?.status ?? 'N/A'}</li>
					</ul>
				</article>

				<article className="game-desc-card">
					<h3>Platform + Links</h3>
					<ul>
						<li>Genre: {game?.genre ?? 'N/A'}</li>
						<li>Platform: {game ? formatPlatform(game.platform) : 'N/A'}</li>
						<li>
							Official URL:{' '}
							{game?.game_url ? (
								<a href={game.game_url} target="_blank" rel="noreferrer">
									Open game page
								</a>
							) : (
								'N/A'
							)}
						</li>
					</ul>
				</article>

				<article className="game-desc-card">
					<h3>System Requirements</h3>
					<ul>
						<li>OS: {requirement?.os ?? 'N/A'}</li>
						<li>Processor: {requirement?.processor ?? 'N/A'}</li>
						<li>Memory: {requirement?.memory ?? 'N/A'}</li>
						<li>Graphics: {requirement?.graphics ?? 'N/A'}</li>
						<li>Storage: {requirement?.storage ?? 'N/A'}</li>
					</ul>
				</article>
			</div>
		</section>
	)
}

export default GameDesc
