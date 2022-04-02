import { useContext, useEffect, useState } from 'react';
import { SearchContext } from '../../context/SearchContext';
import { MemberAvatar } from '../MemberAvatar/MemberAvatar';
import { MemberTag } from '../MemberTag/MemberTag';
import { SpeechContent } from '../SpeechContent/SpeechContent';
import './Speech.scss';

export const Speech = ({memberId, attribution, time, content, ...props}) => {
    const { searchString } = useContext(SearchContext);
    const [ collapsed, setCollapsed ] = useState(false);

    useEffect(() => {
        setCollapsed(searchString && !content.includes(searchString));
    }, [searchString, content]);

    return (
        <div className='Speech'>
            <div className='Speech-left'>
                <MemberAvatar memberId={memberId} />
            </div>
            <div className='Speech-right'>
                <div className='Speech-row'>
                    <MemberTag memberId={memberId} fallbackText={attribution} />
                    <div className='Speech-timestamp'>{time}</div>
                </div>
                { !collapsed ?
                    <SpeechContent>{content}</SpeechContent>
                :
                    <button className="Speech-viewmore" onClick={() => setCollapsed(false)}>tap to view</button>
                }
            </div>
        </div>
    );
};