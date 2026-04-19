import Navbar from '../components/Navbar'

function About() {
	return (
		<div className="app-shell">
			<Navbar variant="top" />

			<div className="app-body">
				<Navbar variant="side" />

				<main className="main">
					<section className="list-panel about-hero-panel">
						<div className="list-header about-header">
							<div>
								<div className="panel-eyebrow">About Gamelink</div>
								<h2>Built For Fast Game Discovery</h2>
							</div>
						</div>

						<p className="about-lead">
							Gamelink is a curated discovery interface for free-to-play titles. It helps players
							filter quickly, compare metadata, and jump from shortlist to detail view with minimal
							friction.
						</p>

						<div className="about-kpis" aria-label="Project highlights">
							<div className="about-kpi-card">
								<span className="about-kpi-label">Stack</span>
								<strong>React + TypeScript + RTK Query</strong>
							</div>
							<div className="about-kpi-card">
								<span className="about-kpi-label">Data Source</span>
								<strong>FreeToGame API</strong>
							</div>
							<div className="about-kpi-card">
								<span className="about-kpi-label">Design Direction</span>
								<strong>Tactical Dashboard UI</strong>
							</div>
						</div>
					</section>

					<section className="list-panel">
						<div className="list-header about-header">
							<div>
								<div className="panel-eyebrow">What This Site Does</div>
								<h2>Core Experience</h2>
							</div>
						</div>
						<div className="about-grid">
							<div className="about-card">
								<h3>Live Browsing</h3>
								<p>Browse current game listings with responsive cards and pagination.</p>
							</div>
							<div className="about-card">
								<h3>Focused Filters</h3>
								<p>Filter by platform, genre, publisher, and release year ranges in one screen.</p>
							</div>
							<div className="about-card">
								<h3>Detail Intelligence</h3>
								<p>View full descriptions, requirements, and quick telemetry-style metrics.</p>
							</div>
							<div className="about-card">
								<h3>Sorted Charts</h3>
								<p>Track newest releases with ranked list navigation to each game detail page.</p>
							</div>
						</div>
					</section>

					<section className="list-panel">
						<div className="list-header about-header">
							<div>
								<div className="panel-eyebrow">Team</div>
								<h2>Developers</h2>
							</div>
						</div>
						<div className="developers-grid" aria-label="Developer names">
							<div className="developer-card">Aguilar, Mark Lorenz</div>
							<div className="developer-card">Apaya, Justin Ray</div>
							<div className="developer-card">Becerel, Kirstein Lawrence</div>
							<div className="developer-card">Reaño, Carlos Jiro</div>
							<div className="developer-card">Sanchez, Kyle Richard</div>
						</div>
					</section>
				</main>
			</div>
		</div>
	)
}

export default About
