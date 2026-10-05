import React, { useState } from "react";

export const SearchContext = React.createContext();

export const SearchProvider = ({ children }) => {
    const [ searchString, setSearchString ] = useState('');
    const [ searchDraft, setSearchDraft ] = useState('');
    const [ selectedParty, setSelectedParty ] = useState('all');
    const [ searchOpen, setSearchOpen ] = useState(false);
    const [ dateRange, setDateRange ] = useState({ startDate: '', endDate: '' });
    const [ dateRangeDraft, setDateRangeDraft ] = useState({ startDate: '', endDate: '' });
    const [ hasAppliedSearch, setHasAppliedSearch ] = useState(false);
    const [ isSearchLoading, setIsSearchLoading ] = useState(false);

    const clearSearchString = () => {
        setSearchString('');
        setSearchDraft('');
        setDateRange({ startDate: '', endDate: '' });
        setDateRangeDraft({ startDate: '', endDate: '' });
        setHasAppliedSearch(false);
    };

    const clearSelectedParty = () => {
        setSelectedParty('all');
    };

    const updateDateRange = (nextRange) => {
        setDateRange((current) => ({
            ...current,
            ...(typeof nextRange === 'function' ? nextRange(current) : nextRange),
        }));
    };

    const clearDateRange = () => {
        setDateRange({ startDate: '', endDate: '' });
        setDateRangeDraft({ startDate: '', endDate: '' });
        setHasAppliedSearch(false);
    };

    const applySearch = (value = searchDraft, nextRange = dateRangeDraft) => {
        const trimmedValue = String(value ?? '').trim();
        setSearchString(trimmedValue);
        setSearchDraft(trimmedValue);
        const nextDateRange = {
            startDate: nextRange?.startDate ?? '',
            endDate: nextRange?.endDate ?? '',
        };
        setDateRange(nextDateRange);
        setDateRangeDraft(nextDateRange);
        setHasAppliedSearch(true);
    };

    return (
        <SearchContext.Provider value={{
            searchString,
            setSearchString,
            clearSearchString,
            searchDraft,
            setSearchDraft,
            applySearch,
            selectedParty,
            setSelectedParty,
            clearSelectedParty,
            searchOpen,
            setSearchOpen,
            dateRange,
            setDateRange: updateDateRange,
            clearDateRange,
            dateRangeDraft,
            setDateRangeDraft,
            hasAppliedSearch,
            setHasAppliedSearch,
            isSearchLoading,
            setIsSearchLoading,
        }}>
            {children}
        </SearchContext.Provider>
    );
};