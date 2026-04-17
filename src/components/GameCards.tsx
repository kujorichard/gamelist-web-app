import type { GameSummary } from '../types/game'
import { formatPlatform, getReleaseTier, getReleaseYear } from '../utility/homeUtils'

type GameCardsProps = {
	game: GameSummary
}

function GameCards({ game }: GameCardsProps) {
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
}

export default GameCards
