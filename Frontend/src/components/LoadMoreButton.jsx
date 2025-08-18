import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function LoadMoreButton({ 
  onLoadMore, 
  isLoading, 
  hasMore, 
  t 
}) {
  if (!hasMore) return null;

  return (
    <div className="sb-load-more-container">
      <button 
        className={`sb-load-more ${isLoading ? 'loading' : ''}`}
        onClick={onLoadMore}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="sb-load-more-spinner" />
            <span>{t.loading || 'Loading...'}</span>
          </>
        ) : (
          <>
            <ChevronDown size={16} />
            <span>{t.loadMoreSessions || 'Load More Sessions'}</span>
          </>
        )}
      </button>
    </div>
  );
}