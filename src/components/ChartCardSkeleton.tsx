import React from 'react';

const ChartCardSkeleton = () => (
    <article className="chart-card skeleton">
      <div className="card-content">
        <div className="rank-badge">
          <div className="skeleton-text" style={{ width: '30px' }}></div>
        </div>
        <div className="card-left">
          <div className="skeleton-img"></div>
        </div>
        <div className="card-right">
          <div className="skeleton-text" style={{ width: '70%' }}></div>
          <div className="skeleton-text" style={{ width: '50%' }}></div>
          <div className="game-meta">
            <div className="skeleton-text" style={{ width: '40px' }}></div>
            <div className="skeleton-text" style={{ width: '80px' }}></div>
          </div>
        </div>
      </div>
    </article>
  );
  
  export default ChartCardSkeleton;
