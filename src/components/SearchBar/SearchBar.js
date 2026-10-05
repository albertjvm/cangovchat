import { useContext } from 'react';
import { SearchContext } from '../../context/SearchContext';
import './SearchBar.scss';

export const SearchBar = () => {
    const { searchString, setSearchString, clearSearchString } = useContext(SearchContext);
    const hasSearchValue = Boolean(searchString.trim());

    return (
        <div className='SearchBar'>
            <input 
                type="text"
                placeholder="Search speeches..."
                aria-label="Search speeches"
                value={searchString}
                onChange={e => setSearchString(e.target.value)}
            />
            {hasSearchValue && (
                <button
                    type="button"
                    onClick={clearSearchString}
                    aria-label="Clear search"
                    title="Clear search"
                >
                    ×
                </button>
            )}
        </div>
    );
};