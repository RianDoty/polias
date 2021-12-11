const avatars = require('../src/components/game/avatars')

function randomInt(max=0, min=0) {
  return min + Math.floor(Math.random() * max)
}

function randomFromTable(tbl) {
  const values = Object.values(tbl);
  const randomIndex = randomInt(values.length);
  
  return values[randomIndex]
}

function randomFromArray(arr) {
  return arr[randomInt(arr.length)]
}

class CardManager {
  constructor() {
    const defaultPack = randomFromTable(avatars);    
    
    this.users = {};
    
    this.assignPack(defaultPack);
  }
  
  
  
  assignPack(pack) {
    this.cardPack = pack;
    const unassignedCards = Object.keys(pack);
    this.notEnoughCards = false;
    
    //Eliminate ids that users are sitting on
    Object.values(this.users)
      .map(u => u.cardId)
      .forEach(id => unassignedCards.filter(c => c !== id))
    
    //Swap ids of users whose cards now don't exist
    Object.values(this.users).forEach(user => {
      if (pack.indexOf(user.cardId) === -1) {
        this.assignCard(user); 
      }
    })
  }
  
  assignCard(user, id) {
    const cardIsAssigned = this.unassignedCards.indexOf(id) === -1
    
    let cardId;
    if (!id || cardIsAssigned) {
      cardId = randomFromArray(this.unassignedCards) || -1;
    } else {
      cardId = id
    }
    
    this.users[user.id] = user;
    user.cardId = cardId
    
    if (cardId === -1) { //a card couldn't be found
      this.notEnoughCards = true;
    }
  }
  
  alertNotEnoughCards() {
    
  }
}

module.exports = CardManager;