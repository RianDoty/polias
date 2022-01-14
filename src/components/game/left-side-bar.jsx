import UserList from './user-list';
import ActionBoard from './action-board';

const SideBar = ({players}) => {
  return ( 
    <div className='left-side-bar'>
      <UserList/>
      <ActionBoard/>
    </div>
  )
}

export default SideBar;