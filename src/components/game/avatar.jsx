import { useContext } from 'react'
import CardPackContext from '../../contexts/cardPack';
import avatars from './avatars'
const {default: defaultAvatar, cardPacks} = avatars;

const Avatar = ({user}) => {
  const {cardId} = user;
  const pack = useContext(CardPackContext)
  console.log(`pack seen as ${pack}`);

  let image = defaultAvatar;
  if (cardId !== -1 && pack !== undefined) {
    image = cardPacks[pack][cardId]
  }
  
  return <img src={image} className='avatar' alt=''/>;
}

export default Avatar