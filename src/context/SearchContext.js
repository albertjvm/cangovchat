import React, { useState } from "react";

export const SearchContext = React.createContext();

export const SearchProvider = ({ children }) => {
    const [ searchString, setSearchString ] = useState('');

    const clearSearchString = () => {
        setSearchString('');
    };

    return (
        <SearchContext.Provider value={{
            searchString,
            setSearchString,
            clearSearchString
        }}>
            {children}
        </SearchContext.Provider>
    );
};