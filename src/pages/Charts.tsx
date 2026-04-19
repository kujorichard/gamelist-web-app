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

  const start = (currentPage - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE

  const paginatedGames = recentGames.slice(start, end)
  const totalPages = Math.ceil(recentGames.length / PAGE_SIZE)

  const openDetails = (id: number) => {
    navigate(`/game/${id}`)
  }

  return (
    <div className="app-shell">
      <Navbar variant="top" />

      <div className="app-body">
        <Navbar variant="side" />

        <main className="main">
          <section className="list-panel charts-panel">
            <div className="list-header charts-header">
              <div>
                <div className="panel-eyebrow">Charts</div>
                <h2>Newest Games</h2>
              </div>
            </div>

            {error && <div className="error-banner">Failed to load games.</div>}

            <div className="charts-list">
              {isLoading &&
                Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <ChartCardSkeleton key={index} />
                ))}

              {!isLoading &&
                paginatedGames.map((game, index) => (
                  <article
                    key={game.id}
                    className="chart-card"
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

            <div className="list-footer">
              <Pagination
                currentPage={currentPage}
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