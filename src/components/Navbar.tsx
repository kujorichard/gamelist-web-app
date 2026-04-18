import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { formatTime } from "../utility/homeUtils"

type NavbarProps =
	| {
			variant: 'top'
		}
	| {
			variant: 'side'
		}

function Navbar(props: NavbarProps) {
	const navigate = useNavigate()
	const location = useLocation()
	const [isSideOpen, setIsSideOpen] = useState(false)
	const isHomeRoute = location.pathname === '/'
	const isPickerRoute = location.pathname.startsWith('/pick-a-game')
	const isChartsRoute = location.pathname === '/charts'

	const localTime = formatTime(new Date())

	if (props.variant === 'top') {
		return (
			<header className="topbar">
				<div className="brand">
					<div className="brand-mark" aria-hidden="true">
						<svg viewBox="0 0 24 24" role="presentation">
							<path
								d="M4 6h6v6H4V6zm10 0h6v6h-6V6zM4 14h6v6H4v-6zm10 4h6"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.4"
							/>
						</svg>
					</div>
					<div>
						<div className="brand-title">GAMELINK</div>
						<div className="brand-sub">VER 1.01</div>
					</div>
				</div>
				<nav className="topnav" aria-label="Primary">
					<button
						className={`topnav-item ${isHomeRoute ? 'active' : ''}`}
						type="button"
						onClick={() => navigate('/')}
						aria-current={isHomeRoute ? 'page' : undefined}
					>
						HOME
					</button>
					<button
						className={`topnav-item ${isChartsRoute ? 'active' : ''}`}
						type="button"
						onClick={() => navigate('/charts')}
						aria-current={isChartsRoute ? 'page' : undefined}
						>
						CHARTS
					</button>
					<button
						className={`topnav-item ${isPickerRoute ? 'active' : ''}`}
						type="button"
						onClick={() => navigate('/pick-a-game')}
						aria-current={isPickerRoute ? 'page' : undefined}
					>
						GAME PICKER
					</button>
					<button className="topnav-item" type="button">
						ABOUT
					</button>
				</nav>
				<div className="topbar-right">
					<div className="pill">
						<span className="dot" aria-hidden="true"></span>Global Index
					</div>
					<div className="time">{localTime}</div>
				</div>
			</header>
		)
	}

	return (
		<div className={`rail-shell ${isSideOpen ? 'open' : ''}`}>
			<button
				className="rail-toggle"
				type="button"
				onClick={() => setIsSideOpen((open) => !open)}
				aria-expanded={isSideOpen}
				aria-controls="side-rail"
				aria-label={isSideOpen ? 'Close side navigation' : 'Open side navigation'}
			>
				<svg viewBox="0 0 24 24" role="presentation">
					<path
						d="M4 6h16M4 12h16M4 18h16"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.4"
					/>
				</svg>
			</button>

			<aside id="side-rail" className="rail" aria-label="Section navigation">
				<button className="rail-btn active" type="button" aria-label="Overview">
					<svg viewBox="0 0 24 24" role="presentation">
						<path
							d="M4 4h7v7H4V4zm9 0h7v4h-7V4zm0 6h7v10h-7V10zM4 13h7v7H4v-7z"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.4"
						/>
					</svg>
				</button>
				<button className="rail-btn" type="button" aria-label="Intel">
					<svg viewBox="0 0 24 24" role="presentation">
						<path
							d="M12 4v4m0 8v4M4 12h4m8 0h4M7.5 7.5l3 3m3 3l3 3m0-9l-3 3m-3 3l-3 3"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.4"
						/>
					</svg>
				</button>
				<button className="rail-btn" type="button" aria-label="Operations">
					<svg viewBox="0 0 24 24" role="presentation">
						<path
							d="M4 7h16M4 12h10M4 17h16"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.4"
						/>
					</svg>
				</button>
				<button className="rail-btn" type="button" aria-label="Logs">
					<svg viewBox="0 0 24 24" role="presentation">
						<path
							d="M5 4h10l4 4v12H5V4zm10 0v4h4"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.4"
						/>
					</svg>
				</button>
				<button className="rail-btn" type="button" aria-label="Users">
					<svg viewBox="0 0 24 24" role="presentation">
						<path
							d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-7 8a7 7 0 0 1 14 0"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.4"
						/>
					</svg>
				</button>
				<div className="rail-divider" aria-hidden="true"></div>
				<button className="rail-btn" type="button" aria-label="Settings">
					<svg viewBox="0 0 24 24" role="presentation">
						<path
							d="M10.5 4h3l1 2 2.2.8-.2 2.2 1.6 2-1.6 2 .2 2.2-2.2.8-1 2h-3l-1-2-2.2-.8.2-2.2-1.6-2 1.6-2-.2-2.2 2.2-.8 1-2zm1.5 6.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.4"
						/>
					</svg>
				</button>
			</aside>
		</div>
	)
}

export default Navbar
