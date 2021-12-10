import avatars from './avatars'
const defaultAvatar = avatars.default;

const Avatar = ({cardId}) => {
  const image = (cardId && avatars[cardId]) || defaultAvatar;
  
  return <img src={image} className='avatar'/>;
}

export default Avatar