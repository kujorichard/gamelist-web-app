import type { CSSProperties } from 'react'
import type { GameSummary } from '../types/game'
import { formatCode, formatPlatform, type PlatformFilter } from '../utility/homeUtils'

type FeaturedCardProps = {
	featuredGame: GameSummary | undefined
	platformFilter: PlatformFilter
	onPlatformFilterChange: (platform: PlatformFilter) => void
	popularityPercent: number | null
	recencyPercent: number | null
}

function FeaturedCard({
	featuredGame,
	platformFilter,
	onPlatformFilterChange,
	popularityPercent,
	recencyPercent,
}: FeaturedCardProps) {
	return (
		<div className="spotlight-panel">
			<div className="spotlight-header">
				<div>
					<div className="panel-eyebrow">Featured Game</div>
					<div className="panel-title">Spotlight Preview</div>
				</div>
				<div className="spotlight-tabs" role="tablist">
					<button
						className={`spotlight-tab ${platformFilter === 'all' ? 'active' : ''}`}
						type="button"
						role="tab"
						onClick={() => onPlatformFilterChange('all')}
					>
						All
					</button>
					<button
						className={`spotlight-tab ${platformFilter === 'pc' ? 'active' : ''}`}
						type="button"
						role="tab"
						onClick={() => onPlatformFilterChange('pc')}
					>
						PC
					</button>
					<button
						className={`spotlight-tab ${platformFilter === 'browser' ? 'active' : ''}`}
						type="button"
						role="tab"
						onClick={() => onPlatformFilterChange('browser')}
					>
						Browser
					</button>
				</div>
			</div>
			<div
				className={`spotlight-canvas ${featuredGame?.thumbnail ? 'cover' : ''}`}
				style={
					featuredGame?.thumbnail
						? ({ ['--cover' as string]: `url(${featuredGame.thumbnail})` } as CSSProperties)
						: undefined
				}
			>
				<div className="spotlight-grid" aria-hidden="true"></div>
				<div className="spotlight-lines" aria-hidden="true"></div>
				<article className="spotlight-card">
					<div className="spotlight-card-header">
						<span className={`status-chip ${featuredGame ? 'featured' : 'standby'}`}>
							{featuredGame ? 'featured' : 'standby'}
						</span>
						<span className="unit-code">
							{featuredGame ? formatCode(featuredGame.id) : 'GX-0000'}
						</span>
						<button className="icon-button" type="button" aria-label="Open game details">
							<svg viewBox="0 0 24 24" role="presentation">
								<path
									d="M7 17h10V7m0 0H9m8 0-9 9"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.4"
								/>
							</svg>
						</button>
					</div>
					<div className="spotlight-card-title">
						{featuredGame ? featuredGame.title : 'No featured title'}
					</div>
					<p className="spotlight-card-desc">
						{featuredGame
							? featuredGame.short_description
							: 'No featured title is available from the current feed.'}
					</p>
					<div className="spotlight-card-meta">
						<div>
							<span className="meta-label">Genre</span>
							<span className="meta-value">
								{featuredGame ? featuredGame.genre : 'N/A'}
							</span>
						</div>
						<div>
							<span className="meta-label">Platform</span>
							<span className="meta-value">
								{featuredGame ? formatPlatform(featuredGame.platform) : 'N/A'}
							</span>
						</div>
						<div>
							<span className="meta-label">Release</span>
							<span className="meta-value">
								{featuredGame ? featuredGame.release_date : 'N/A'}
							</span>
						</div>
					</div>
					<div className="spotlight-card-meters">
						<div className="meter-row">
							<span>Popularity</span>
							<div className="meter">
								<div
									className="meter-fill"
									style={{ width: `${popularityPercent ?? 0}%` }}
								></div>
							</div>
							<span className="meter-value">
								{popularityPercent !== null ? `${popularityPercent}%` : 'N/A'}
							</span>
						</div>
						<div className="meter-row">
							<span>Recency</span>
							<div className="meter">
								<div
									className="meter-fill alt"
									style={{ width: `${recencyPercent ?? 0}%` }}
								></div>
							</div>
							<span className="meter-value">
								{recencyPercent !== null ? `${recencyPercent}%` : 'N/A'}
							</span>
						</div>
					</div>
					<div className="spotlight-card-footer">
						<span className="chip-sub">
							{featuredGame
								? `Publisher: ${featuredGame.publisher} / Developer: ${featuredGame.developer}`
								: 'Publisher and developer data unavailable.'}
						</span>
					</div>
				</article>
			</div>
		</div>
	)
}

export default FeaturedCard
