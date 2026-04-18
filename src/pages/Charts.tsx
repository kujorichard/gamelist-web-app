import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetGamesSortedQuery } from '../rtk/gameApi'
import Pagination from '../components/Pagination'
import '../styles/Charts.css'
import Navbar from '../components/Navbar'
import ChartCardSkeleton from '../components/ChartCardSkeleton'

const Charts = () => {
  const navigate = useNavigate()

  const { data: recentGames = [], isLoading, error } =
    useGetGamesSortedQuery('release-date')

  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 15

  if (isLoading) {
    return (
      <>
        <Navbar variant="top" />
        <div className="container">
          <h1 className="title">Newest Games</h1>
          <div className="charts-list">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <ChartCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </>
    )
  }
  if (error) return <p>Failed to load games</p>

  const start = (currentPage - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE

  const paginatedGames = recentGames.slice(start, end)
  const totalPages = Math.ceil(recentGames.length / PAGE_SIZE)

  const openDetails = (id: number) => {
    navigate(`/game/${id}`)
  }

  return (
    <>
        <Navbar variant="top" />
        <div className="container">
        <h1 className="title">Newest Games</h1>

        <div className="charts-list">
            {paginatedGames.map((game, index) => (
            <article
            key={game.id}
            className="chart-card"
            onClick={() => openDetails(game.id)}
            role="button"
            tabIndex={0}
            >

            <div className="card-content">

                <div className="rank-badge">
                    #{start + index + 1}
                </div>

                <div className="card-left">
                {game.thumbnail ? (
                    <img src={game.thumbnail} alt={game.title} />
                ) : (
                    <div className="thumb-placeholder" />
                )}
                </div>

                <div className="card-right">
                <div className="game-title">{game.title}</div>
                <div className="game-sub">{game.publisher}</div>

                <div className="game-meta">
                    <span>{game.platform}</span>
                    <span>{game.release_date}</span>
                </div>
                </div>

            </div>
            </article>
            ))}
        </div>

        <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
        />
        </div>
    </>
  )
}

export default Charts