import { useContext, useEffect, useMemo } from 'react';
import { SearchContext } from '../../context/SearchContext';
import { SpeechesContext } from '../../context/SpeechesContext';
import { getMeetingDates } from '../../utils/dateUtils';
import './SearchBar.scss';

const PARTY_OPTIONS = ['all', 'Liberal', 'Conservative', 'NDP', 'Bloc Québécois', 'Green'];

export const SearchBar = () => {
    const speechesContext = useContext(SpeechesContext) || {};
    const { speeches = [], isLoading = false, isFetchingNextPage = false } = speechesContext;
    const {
        searchDraft = '',
        setSearchString,
        setSearchDraft,
        clearSearchString,
        applySearch,
        selectedParty,
        setSelectedParty,
        clearSelectedParty,
        dateRange = { startDate: '', endDate: '' },
        dateRangeDraft = { startDate: '', endDate: '' },
        setDateRangeDraft,
        clearDateRange,
        searchOpen,
        setSearchOpen,
        isSearchLoading = false,
    } = useContext(SearchContext);

    const availableDates = useMemo(() => getMeetingDates(speeches), [speeches]);
    const earliestLoadedDate = availableDates[availableDates.length - 1] || '';
    const latestLoadedDate = availableDates[0] || '';

    useEffect(() => {
        if (typeof setDateRangeDraft === 'function' && !dateRangeDraft.startDate && !dateRangeDraft.endDate && earliestLoadedDate && latestLoadedDate) {
            setDateRangeDraft({
                startDate: earliestLoadedDate,
                endDate: latestLoadedDate,
            });
        }
    }, [dateRangeDraft, earliestLoadedDate, latestLoadedDate, setDateRangeDraft]);

    const hasSearchValue = Boolean(searchDraft.trim());
    const closeSearch = () => setSearchOpen(false);
    const activeDateRange = dateRangeDraft.startDate || dateRangeDraft.endDate ? dateRangeDraft : { startDate: earliestLoadedDate, endDate: latestLoadedDate };

    const handleApplySearch = () => {
        if (typeof applySearch === 'function') {
            applySearch(searchDraft, dateRangeDraft);
            return;
        }

        if (typeof setSearchString === 'function') {
            setSearchString(String(searchDraft ?? '').trim());
        }
    };

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
                    <form
                        className='SearchBar-form'
                        onSubmit={(event) => {
                            event.preventDefault();
                            handleApplySearch();
                        }}
                    >
                        <div className='SearchBar-inputWrap'>
                            <input
                                type="text"
                                placeholder="Search speeches..."
                                aria-label="Search speeches"
                                value={searchDraft}
                                onChange={event => setSearchDraft(event.target.value)}
                            />
                            {hasSearchValue && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (typeof clearSearchString === 'function') {
                                            clearSearchString();
                                        } else if (typeof setSearchString === 'function') {
                                            setSearchString('');
                                        }
                                        if (typeof setSearchDraft === 'function') {
                                            setSearchDraft('');
                                        }
                                    }}
                                    aria-label="Clear search"
                                    title="Clear search"
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        <div className='SearchBar-dateRange'>
                            <div className='SearchBar-dateRangeHeader'>
                                <span>Date range</span>
                                {(dateRangeDraft.startDate || dateRangeDraft.endDate || dateRange.startDate || dateRange.endDate) && (
                                    <button
                                        type='button'
                                        className='SearchBar-clearFilter'
                                        onClick={clearDateRange}
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            <div className='SearchBar-dateFields'>
                                <label>
                                    <span>From</span>
                                    <input
                                        type='date'
                                        value={activeDateRange.startDate}
                                        onChange={(event) => setDateRangeDraft({ startDate: event.target.value, endDate: activeDateRange.endDate })}
                                    />
                                </label>
                                <label>
                                    <span>To</span>
                                    <input
                                        type='date'
                                        value={activeDateRange.endDate}
                                        onChange={(event) => setDateRangeDraft({ startDate: activeDateRange.startDate, endDate: event.target.value })}
                                    />
                                </label>
                            </div>
                        </div>

                                        <div className='SearchBar-actions'>
                            <button
                                type='submit'
                                className='SearchBar-searchButton'
                                disabled={isLoading || isFetchingNextPage || isSearchLoading}
                            >
                                Search
                            </button>
                        </div>
                    </form>

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