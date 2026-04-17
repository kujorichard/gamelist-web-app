type PaginationProps = {
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
}

const getVisiblePages = (currentPage: number, totalPages: number) => {
	const maxVisiblePages = 10

	if (totalPages <= maxVisiblePages) {
		return Array.from({ length: totalPages }, (_, index) => index + 1)
	}

	const halfWindow = Math.floor(maxVisiblePages / 2)
	let start = currentPage - halfWindow
	let end = start + maxVisiblePages - 1

	if (start < 1) {
		start = 1
		end = maxVisiblePages
	}

	if (end > totalPages) {
		end = totalPages
		start = totalPages - maxVisiblePages + 1
	}

	return Array.from(
		{ length: end - start + 1 },
		(_, index) => start + index,
	)
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
	if (totalPages <= 1) {
		return null
	}

	const pages = getVisiblePages(currentPage, totalPages)

	return (
		<nav className="pagination" aria-label="Game list pagination">
			<button
				type="button"
				className="pagination-btn"
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
			>
				Prev
			</button>
			{pages.map((page) => (
				<button
					type="button"
					key={page}
					className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
					onClick={() => onPageChange(page)}
					aria-current={page === currentPage ? 'page' : undefined}
				>
					{page}
				</button>
			))}
			<button
				type="button"
				className="pagination-btn"
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
			>
				Next
			</button>
		</nav>
	)
}

export default Pagination
