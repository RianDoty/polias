import UserList from './user-list';

const SideBar = ({players}) => {
  return ( 
    <div className='left-side-bar'>
      <UserList/>
    </div>
  )
}

export default SideBar;