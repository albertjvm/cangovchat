import { useContext } from 'react';
import { SearchContext } from '../../context/SearchContext';
import { normalizeSearchTerm } from '../../utils/search';
import './SpeechContent.scss';

const escapeHtml = (value = '') =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

const escapeRegExp = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const SpeechContent = ({ className = '', children }) => {
    const { searchString } = useContext(SearchContext);

    if (typeof children !== 'string') return <div>Content must be string</div>;

    const normalizedSearch = normalizeSearchTerm(searchString);

    if (!normalizedSearch) {
        return <div className={`SpeechContent ${className}`}>{children}</div>;
    }

    const highlighted = escapeHtml(children).replace(
        new RegExp(`(${escapeRegExp(normalizedSearch)})`, 'gi'),
        '<mark class="highlight">$1</mark>'
    );

    return (
        <div
            className={`SpeechContent ${className}`}
            dangerouslySetInnerHTML={{ __html: highlighted }}
        />
    );
};