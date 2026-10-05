import React, { useState } from "react";

export const SearchContext = React.createContext();

export const SearchProvider = ({ children }) => {
    const [ searchString, setSearchString ] = useState('');
    const [ selectedParty, setSelectedParty ] = useState('all');
    const [ searchOpen, setSearchOpen ] = useState(false);

    const clearSearchString = () => {
        setSearchString('');
    };

    const clearSelectedParty = () => {
        setSelectedParty('all');
    };

    return (
        <SearchContext.Provider value={{
            searchString,
            setSearchString,
            clearSearchString,
            selectedParty,
            setSelectedParty,
            clearSelectedParty,
            searchOpen,
            setSearchOpen
        }}>
            {children}
        </SearchContext.Provider>
    );
};