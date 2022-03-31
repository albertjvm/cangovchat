import { useContext, useEffect, useState } from 'react';
import { MembersContext } from '../../context/MembersContext';
import './MemberAvatar.scss';

export const MemberAvatar = ({ memberId }) => {
    const [ member, setMember ] = useState(null);
    const [ isError, setIsError ] = useState(false);
    const { members = [] } = useContext(MembersContext);

    useEffect(() => {
        setMember(
            members.find(({ id }) => id === memberId)
        );
    }, [memberId, members]);
    
    console.log(member);
    return (
        <div className='MemberAvatar'>
            { (!!member && !isError) ? 
                <img 
                    src={`https://api.openparliament.ca${member?.image}`}
                    alt={`Avatar of ${member?.name}`}
                    onError={() => setIsError(true)}
                /> 
            : 
                <div className='MemberAvatar-error'/> 
            }
        </div>
    );
};