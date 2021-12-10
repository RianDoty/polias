import avatars from './avatars'
const defaultAvatar = avatars.default;

const Avatar = ({pack, cardId}) => {
  const image = (pack && cardId && avatars[pack][cardId]) || defaultAvatar;
  
  return <img src={image} className='avatar'/>;
}

export default Avatar