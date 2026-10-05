import { useContext } from 'react';
import { SearchContext } from '../../context/SearchContext';
import { normalizeSearchTerm } from '../../utils/search';
import './SearchResultsPanel.scss';

const escapeHtml = (value = '') =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

const escapeRegExp = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightText = (value = '', query = '') => {
    const normalizedQuery = normalizeSearchTerm(query);

    if (!normalizedQuery) {
        return escapeHtml(value);
    }

    const escaped = escapeHtml(value);
    return escaped.replace(
        new RegExp(`(${escapeRegExp(normalizedQuery)})`, 'gi'),
        '<mark class="highlight">$1</mark>'
    );
};

export const SearchResultsPanel = ({
    results = [],
    onSelect,
    onLoadMore,
    hasMore = false,
    isLoadingMore = false,
    earliestAvailableDate = '',
}) => {
    const {
        searchString,
        clearSearchString,
        setSearchOpen,
        setSearchDraft,
    } = useContext(SearchContext);

    const closeSearch = () => setSearchOpen(false);

    const clearResults = () => {
        clearSearchString();
        if (typeof setSearchDraft === 'function') {
            setSearchDraft('');
        }
        closeSearch();
    };

    const handleSelect = (resultId) => {
        closeSearch();
        onSelect(resultId);
    };

    const expandDateRangeLabel = isLoadingMore ? 'Expanding date range...' : 'Expand date range';

    return (
        <aside className='SearchResultsPanel' onClick={closeSearch}>
            {isLoadingMore && (
                <div className='SearchResultsPanel-status' role='status' aria-live='polite'>
                    <span className='SearchResultsPanel-spinner' aria-hidden='true' />
                    <strong>Searching earlier speeches…</strong>
                    <small>Expanding the date range and loading more matches.</small>
                </div>
            )}
            <div className='SearchResultsPanel-header'>
                <span>Search results</span>
                <div className='SearchResultsPanel-headerActions'>
                    <strong>{results.length}</strong>
                    {searchString.trim() && (
                        <button
                            type='button'
                            className='SearchResultsPanel-clear'
                            aria-label='Clear search results'
                            title='Clear search results'
                            onClick={(event) => {
                                event.stopPropagation();
                                clearResults();
                            }}
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>
            {results.length === 0 ? (
                <div className='SearchResultsPanel-empty'>
                    <strong>No results found</strong>
                    <span>
                        {hasMore
                            ? 'No matches in the current date range. Expand the search window.'
                            : 'Try a different keyword, date range, or party filter.'}
                    </span>
                    {hasMore && (
                        <>
                            <button
                                type='button'
                                className='SearchResultsPanel-loadMore'
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setSearchOpen(true);
                                }}
                                disabled={isLoadingMore}
                            >
                                {expandDateRangeLabel}
                            </button>
                            <small className='SearchResultsPanel-loadMoreHint'>Increase the date window to keep searching further back.</small>
                        </>
                    )}
                </div>
            ) : (
                <>
                    <div className='SearchResultsPanel-list'>
                        {results.map((result) => (
                            <button
                                key={result.id}
                                type='button'
                                className='SearchResultsPanel-item'
                                onClick={() => handleSelect(result.id)}
                            >
                                <div className='SearchResultsPanel-meta'>
                                    <span>{result.memberName || result.attribution}</span>
                                    <time>{result.time}</time>
                                </div>
                                <div
                                    className='SearchResultsPanel-snippet'
                                    dangerouslySetInnerHTML={{
                                        __html: highlightText(result.snippet || '', searchString),
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                    {hasMore && (
                        <div className='SearchResultsPanel-footer'>
                            <button
                                type='button'
                                className='SearchResultsPanel-loadMore'
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setSearchOpen(true);
                                }}
                                disabled={isLoadingMore}
                            >
                                {expandDateRangeLabel}
                            </button>
                            <small className='SearchResultsPanel-loadMoreHint'>Increase the date window to keep searching further back.</small>
                        </div>
                    )}
                </>
            )}
        </aside>
    );
};
