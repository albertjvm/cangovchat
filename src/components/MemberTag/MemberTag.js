import { useContext, useEffect, useState } from 'react';
import { MembersContext } from '../../context/MembersContext';
import './MemberTag.scss';

export const MemberTag = ({ memberId, fallbackText }) => {
    const [ member, setMember ] = useState(null);
    const { members = [] } = useContext(MembersContext);

    useEffect(() => {
        setMember(
            members.find(({ id }) => id === memberId)
        );
    }, [memberId, members]);
    
    return (
        <div className={['MemberTag', member?.party?.toLowerCase()].join(' ')}>
            { !!member ? 
            <>{member.name} ({member.riding})</>
            : fallbackText }
        </div>
    );
};