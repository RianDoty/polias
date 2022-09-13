import React, { useContext } from "react";
import { UserTemplate } from "../../../server/user";
import CardPackContext from "../../contexts/cardPack";
import avatars from "./avatars.json";
const { default: defaultAvatar, cardPacks } = avatars;

const Avatar = ({ user }: { user: UserTemplate }) => {
  const { cardId } = user;
  const [loading, pack] = useContext(CardPackContext);

  let image = defaultAvatar;
  if (
    !loading && //The avatar isn't loading
    pack !== undefined && //The pack is defined
    cardPacks[pack] && //The pack exists
    cardPacks[pack].indexOf(cardId) !== -1 //The cardId exists in the pack
  ) {
    console.log(`Getting card: ${cardPacks} ${pack} ${cardId}`);
    image = cardPacks[pack][cardId];
  }

  return <img src={image} className="avatar" alt="" />;
};

export default Avatar;
