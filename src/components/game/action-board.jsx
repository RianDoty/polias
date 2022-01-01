import { useContext } from 'react';
import UserContext from '../../contexts/user';

import '../../styles/action-board.css'

const ActionGroup = ({name, children}) => (
    <div className='action-group'>
        <div className='action-group-name muted'>{name}</div>
        {children}
    </div>
)

const ActionBoard = () => {
    const user = useContext(UserContext);

    return (
    <div className='action-board'>
        <div className = 'action-board-header'>Actions</div>
        <ActionGroup name='User'>
            <button className='button'>Become a Player</button>
        </ActionGroup>
        <ActionGroup name='Host'>
            <button className='button'>Start Game</button>
        </ActionGroup>
    </div>
    )
}

export default ActionBoard;