import { useContext } from 'react';
import { SearchContext } from '../../context/SearchContext';
import './SearchBar.scss';

export const SearchBar = () => {
    const { searchString, setSearchString, clearSearchString } = useContext(SearchContext);
    return (
        <div className='SearchBar'>
            <input 
                type="text"
                placeholder="Search..."
                value={searchString}
                onChange={e => setSearchString(e.target.value)}
            />
            <button onClick={clearSearchString} className="fas fa-times" />
        </div>
    );
};