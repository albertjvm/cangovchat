import React from 'react';
import { MemberAvatar } from '../MemberAvatar/MemberAvatar';
import { MemberTag } from '../MemberTag/MemberTag';
import { SpeechContent } from '../SpeechContent/SpeechContent';
import './Speech.scss';

export const Speech = React.forwardRef(({ memberId, attribution, time, content, ...props }, ref) => {
    return (
        <div className='Speech' ref={ref}>
            <div className='Speech-left'>
                <MemberAvatar memberId={memberId} />
            </div>
            <div className='Speech-right'>
                <div className='Speech-row'>
                    <MemberTag memberId={memberId} fallbackText={attribution} />
                    <div className='Speech-timestamp'>{time}</div>
                </div>
                <SpeechContent>{content}</SpeechContent>
            </div>
        </div>
    );
});

Speech.displayName = 'Speech';