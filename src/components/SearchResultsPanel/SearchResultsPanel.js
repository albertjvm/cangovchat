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

export const SearchResultsPanel = ({ results = [], onSelect }) => {
    const { searchString, setSearchOpen } = useContext(SearchContext);

    const handleSelect = (resultId) => {
        setSearchOpen(false);
        onSelect(resultId);
    };

    return (
        <aside className='SearchResultsPanel'>
            <div className='SearchResultsPanel-header'>
                <span>Search results</span>
                <strong>{results.length}</strong>
            </div>
            {results.length === 0 ? (
                <div className='SearchResultsPanel-empty'>
                    <strong>No results found</strong>
                    <span>Try a different keyword or party filter.</span>
                </div>
            ) : (
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
            )}
        </aside>
    );
};
