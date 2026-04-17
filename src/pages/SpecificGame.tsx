import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import GameDesc from '../components/GameDesc'
import MainCard from '../components/MainCard'
import Navbar from '../components/Navbar'
import { useGetGameByIdQuery, useGetGamesQuery, useGetGamesSortedQuery } from '../rtk/gameApi'
import { formatTime } from '../utility/homeUtils'

function SpecificGame() {
	const { id } = useParams<{ id: string }>()
	const gameId = Number(id)
	const isValidGameId = Number.isFinite(gameId) && gameId > 0

	const { data: gameData, isLoading: isGameLoading, isError: isGameError } =
		useGetGameByIdQuery(gameId, {
			skip: !isValidGameId,
		})
	const { data: games = [] } = useGetGamesQuery()
	const { data: popularityGames = [] } = useGetGamesSortedQuery('popularity')

	const popularityRank = useMemo(() => {
		const ranks = new Map<number, number>()
		popularityGames.forEach((game, index) => {
			ranks.set(game.id, index)
		})
		return ranks
	}, [popularityGames])

	const localTime = formatTime(new Date())

	return (
		<div className="app-shell">
			<Navbar variant="top" localTime={localTime} />

			<div className="app-body">
				<Navbar variant="side" />

				<main className="main">
					<MainCard
						game={gameData ?? null}
						allGamesReleaseYearsSource={games}
						popularityRank={popularityRank}
						popularityCount={popularityGames.length}
						isLoading={isGameLoading}
						isError={!isValidGameId || isGameError}
					/>

					<GameDesc
						game={gameData ?? null}
						isLoading={isGameLoading}
						isError={!isValidGameId || isGameError}
					/>
				</main>
			</div>
		</div>
	)
}

export default SpecificGame
