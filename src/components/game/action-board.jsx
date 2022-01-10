import { useContext } from 'react';
import UserContext from '../../contexts/user';

import '../../styles/action-board.css'

const ActionGroup = ({name, children}) => (
    <div className='action-group'>
        <div className='action-group-name muted'>{name}</div>
        {children}
    </div>
)

const SwapSpectatePlayButton = () => {
    const {playing, setPlaying} = useContext(UserContext);

    const onClick = (e) => {
        //Toggle whether or not the player is playing or not
        setPlaying(!playing)
    }

    return (
    <button className='button' onClick={onClick}>
        {playing ? 'Spectate' : 'Play'}
    </button>
    )
}

const UserGroup = () => (
    <ActionGroup name='User'>
        <SwapSpectatePlayButton/>
    </ActionGroup>
)

const ActionBoard = () => {
    const user = useContext(UserContext);

    return (
    <div className='action-board'>
        <div className = 'action-board-header'>Actions</div>
        <UserGroup/>
        <ActionGroup name='Host'>
            <button className='button'>Start Game</button>
        </ActionGroup>
    </div>
    )
}

export default ActionBoard;