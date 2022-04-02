import { useContext } from 'react';
import { SearchContext } from '../../context/SearchContext';
import './SpeechContent.scss';

export const SpeechContent = ({ className = '', children }) => {
    const { searchString } = useContext(SearchContext);

    if (typeof children !== 'string') return <div>Content must be string</div>;

    const getClassName = (s) => {
        if (!!searchString) {
            if (s.includes(searchString)) {
                return 'highlight';
            } else {
                return 'unhighlight';
            }
        }
        return '';
    };
    
    return (
        <div className={`SpeechContent ${className}`}>
            {children.split('.').map(((s, i) => (
                <span key={i} className={getClassName(s)} >{s}.</span>
            )))}
        </div>
    );
};