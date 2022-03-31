import { MemberAvatar } from '../MemberAvatar/MemberAvatar';
import { MemberTag } from '../MemberTag/MemberTag';
import './Speech.scss';

export const Speech = ({memberId, attribution, time, content, ...props}) => {
    // console.log(props);

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
                <div className='Speech-content'>{content}</div>
            </div>
        </div>
    );
};