import { useContext } from 'react';
import { SearchContext } from '../../context/SearchContext';
import './SearchBar.scss';

const PARTY_OPTIONS = ['all', 'Liberal', 'Conservative', 'NDP', 'Bloc Québécois', 'Green'];

export const SearchBar = () => {
    const {
        searchString,
        setSearchString,
        clearSearchString,
        selectedParty,
        setSelectedParty,
        clearSelectedParty,
        searchOpen,
        setSearchOpen
    } = useContext(SearchContext);

    const hasSearchValue = Boolean(searchString.trim());
    const closeSearch = () => setSearchOpen(false);

    return (
        <div className={`SearchBar ${searchOpen ? 'is-open' : ''}`}>
            <button
                type="button"
                className='SearchBar-toggle'
                aria-label={searchOpen ? 'Close search' : 'Open search'}
                aria-expanded={searchOpen}
                onClick={() => setSearchOpen((open) => !open)}
                title={searchOpen ? 'Close search' : 'Search speeches'}
            >
                ⌕
            </button>

            {searchOpen && (
                <div className='SearchBar-panel'>
                    <div className='SearchBar-inputWrap'>
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

                    <div className='SearchBar-filters-header'>
                        <span>Party</span>
                        {selectedParty !== 'all' && (
                            <button
                                type='button'
                                className='SearchBar-clearFilter'
                                onClick={() => {
                                    clearSelectedParty();
                                }}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <div className='SearchBar-filters' aria-label="Filter by party">
                        {PARTY_OPTIONS.map((party) => {
                            const isActive = selectedParty === party;
                            const label = party === 'all' ? 'All' : party;

                            return (
                                <button
                                    key={party}
                                    type="button"
                                    className={isActive ? 'is-active' : ''}
                                    onClick={() => {
                                        if (party === 'all') {
                                            clearSelectedParty();
                                            closeSearch();
                                            return;
                                        }
                                        setSelectedParty(party);
                                        closeSearch();
                                    }}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};