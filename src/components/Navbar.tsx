import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { formatTime } from '../utility/homeUtils'

type NavbarProps =
	| {
			variant: 'top'
	  }
	| {
			variant: 'side'
	  }

const STORAGE_KEYS = {
	theme: 'gamelink-theme',
	density: 'gamelink-density',
	motion: 'gamelink-motion',
}

function Navbar(props: NavbarProps) {
	const navigate = useNavigate()
	const location = useLocation()
	const [isSideOpen, setIsSideOpen] = useState(false)
	const [time, setTime] = useState(new Date())
	const [isLightTheme, setIsLightTheme] = useState(false)
	const [isCompact, setIsCompact] = useState(false)
	const [isReducedMotion, setIsReducedMotion] = useState(false)
	const [hasThemePreference, setHasThemePreference] = useState(false)
	const [hasLoadedPrefs, setHasLoadedPrefs] = useState(false)
	const MOBILE_BREAKPOINT = 900
	const isHomeRoute = location.pathname === '/'
	const isPickerRoute = location.pathname.startsWith('/pick-a-game')
	const isChartsRoute = location.pathname === '/charts'
	const isAboutRoute = location.pathname === '/about'

	useEffect(() => {
		const timer = setInterval(() => {
			setTime(new Date())
		}, 1000)
		return () => clearInterval(timer)
	}, [])

	useEffect(() => {
		if (typeof window === 'undefined') {
			return
		}

		const storedTheme = window.localStorage.getItem(STORAGE_KEYS.theme)
		const storedDensity = window.localStorage.getItem(STORAGE_KEYS.density)
		const storedMotion = window.localStorage.getItem(STORAGE_KEYS.motion)
		const hasStoredTheme = storedTheme === 'light' || storedTheme === 'dark'

		if (hasStoredTheme) {
			setIsLightTheme(storedTheme === 'light')
			setHasThemePreference(true)
		} else {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
			setIsLightTheme(mediaQuery.matches)
			setHasThemePreference(false)
		}

		setIsCompact(storedDensity === 'compact')
		setIsReducedMotion(storedMotion === 'reduce')
		setHasLoadedPrefs(true)
	}, [])

	useEffect(() => {
		if (typeof window === 'undefined' || !hasLoadedPrefs) {
			return
		}

		const root = document.documentElement
		root.classList.toggle('theme-light', isLightTheme)
		root.classList.toggle('density-compact', isCompact)
		root.classList.toggle('reduce-motion', isReducedMotion)

		if (hasThemePreference) {
			window.localStorage.setItem(STORAGE_KEYS.theme, isLightTheme ? 'light' : 'dark')
		} else {
			window.localStorage.removeItem(STORAGE_KEYS.theme)
		}
		window.localStorage.setItem(STORAGE_KEYS.density, isCompact ? 'compact' : 'comfortable')
		window.localStorage.setItem(STORAGE_KEYS.motion, isReducedMotion ? 'reduce' : 'full')
	}, [isLightTheme, isCompact, isReducedMotion, hasThemePreference, hasLoadedPrefs])

	useEffect(() => {
		if (typeof window === 'undefined' || hasThemePreference) {
			return
		}

		const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
		const handleChange = (event: MediaQueryListEvent) => {
			setIsLightTheme(event.matches)
		}

		if (mediaQuery.addEventListener) {
			mediaQuery.addEventListener('change', handleChange)
			return () => mediaQuery.removeEventListener('change', handleChange)
		}

		mediaQuery.addListener(handleChange)
		return () => mediaQuery.removeListener(handleChange)
	}, [hasThemePreference])

	const localTime = formatTime(time)
	const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

	const handleRailAction = () => {
		if (typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT) {
			setIsSideOpen(false)
		}
	}

	const handleThemeToggle = () => {
		setHasThemePreference(true)
		setIsLightTheme((current) => !current)
		handleRailAction()
	}

	const handleDensityToggle = () => {
		setIsCompact((current) => !current)
		handleRailAction()
	}

	const handleMotionToggle = () => {
		setIsReducedMotion((current) => !current)
		handleRailAction()
	}

	const handleScrollTo = (position: 'top' | 'bottom') => {
		if (typeof window === 'undefined') {
			return
		}

		const targetTop =
			position === 'top'
				? 0
				: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)

		window.scrollTo({
			top: targetTop,
			left: 0,
			behavior: isReducedMotion ? 'auto' : 'smooth',
		})
		handleRailAction()
	}

	const handleResetPreferences = () => {
		if (typeof window !== 'undefined') {
			window.localStorage.removeItem(STORAGE_KEYS.theme)
			window.localStorage.removeItem(STORAGE_KEYS.density)
			window.localStorage.removeItem(STORAGE_KEYS.motion)
			const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
			setIsLightTheme(mediaQuery.matches)
		} else {
			setIsLightTheme(false)
		}
		setHasThemePreference(false)
		setIsCompact(false)
		setIsReducedMotion(false)
		handleRailAction()
	}

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
					<button
						className={`topnav-item ${isAboutRoute ? 'active' : ''}`}
						type="button"
						onClick={() => navigate('/about')}
						aria-current={isAboutRoute ? 'page' : undefined}
					>
						ABOUT
					</button>
				</nav>
				<div className="topbar-right">
					<div className="pill">
						<span className="dot" aria-hidden="true"></span>
						{timezone}
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

			<aside id="side-rail" className="rail" aria-label="Utility controls">
				<button
					className={`rail-btn ${isLightTheme ? 'active' : ''}`}
					type="button"
					aria-label={isLightTheme ? 'Switch to dark theme' : 'Switch to light theme'}
					aria-pressed={isLightTheme}
					onClick={handleThemeToggle}
				>
					{isLightTheme ? (
						<svg viewBox="0 0 24 24" role="presentation">
							<path
								d="M12 4.5v2.5m0 10v2.5M4.5 12H7m10 0h2.5M6.4 6.4l1.8 1.8m7.6 7.6l1.8 1.8M6.4 17.6l1.8-1.8m7.6-7.6l1.8-1.8M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.4"
							/>
						</svg>
					) : (
						<svg viewBox="0 0 24 24" role="presentation">
							<path
								d="M14.5 4.5a7 7 0 1 0 5 12.5A8.5 8.5 0 1 1 14.5 4.5z"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.4"
							/>
						</svg>
					)}
				</button>
				<button
					className={`rail-btn ${isCompact ? 'active' : ''}`}
					type="button"
					aria-label={isCompact ? 'Switch to comfortable density' : 'Switch to compact density'}
					aria-pressed={isCompact}
					onClick={handleDensityToggle}
				>
					{isCompact ? (
						<svg viewBox="0 0 24 24" role="presentation">
							<path
								d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.4"
							/>
						</svg>
					) : (
						<svg viewBox="0 0 24 24" role="presentation">
							<path
								d="M4 6h16M4 12h16M4 18h16"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.4"
							/>
						</svg>
					)}
				</button>
				<button
					className={`rail-btn ${isReducedMotion ? 'active' : ''}`}
					type="button"
					aria-label={isReducedMotion ? 'Enable motion' : 'Reduce motion'}
					aria-pressed={isReducedMotion}
					onClick={handleMotionToggle}
				>
					{isReducedMotion ? (
						<svg viewBox="0 0 24 24" role="presentation">
							<path
								d="M7 6h3v12H7V6zm7 0h3v12h-3V6z"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.4"
							/>
						</svg>
					) : (
						<svg viewBox="0 0 24 24" role="presentation">
							<path
								d="M8 5l11 7-11 7V5z"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.4"
							/>
						</svg>
					)}
				</button>
				<button
					className="rail-btn"
					type="button"
					aria-label="Scroll to top"
					onClick={() => handleScrollTo('top')}
				>
					<svg viewBox="0 0 24 24" role="presentation">
						<path
							d="M12 19V5m-5 5l5-5 5 5"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.4"
						/>
					</svg>
				</button>
				<button
					className="rail-btn"
					type="button"
					aria-label="Scroll to bottom"
					onClick={() => handleScrollTo('bottom')}
				>
					<svg viewBox="0 0 24 24" role="presentation">
						<path
							d="M12 5v14m-5-5l5 5 5-5"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.4"
						/>
					</svg>
				</button>
				<div className="rail-divider" aria-hidden="true"></div>
				<button
					className="rail-btn"
					type="button"
					aria-label="Reset view preferences"
					onClick={handleResetPreferences}
				>
					<svg viewBox="0 0 24 24" role="presentation">
						<path
							d="M4 12a8 8 0 0 1 13.5-5.5M20 12a8 8 0 0 1-13.5 5.5M16.5 4.5v4h-4"
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
