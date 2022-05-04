const {cardPacks} = require('../src/components/game/avatars')
const SyncHost = require('./sync.js');

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

//Manages assigning cards from a certain pack to users
class CardManager {
  constructor(room) {
    this.room = room;

    const defaultPack = randomFromTable(cardPacks);
    this.users = {};

    //Assign
    this.assignPack(defaultPack);
    Object.values(this.users).forEach(u => this.assignCard(u));
  }
  
  getPackName(pack) {
    return Object.entries(cardPacks).find(([, v]) => v == pack)[0]
  }

  assignPack(pack) {
    if (!pack) return false;

    this.cardPack = pack;
    const unassignedCards = Object.keys(pack);
    this.unassignedCards = unassignedCards
    this.notEnoughCards = false;
    this.room.stateSync.update('cardPack', this.getPackName(pack));

    //Update the room's state
    
    //If there are no users yet to consider, return
    if (!Object.keys(this.users).length) return;
    console.log(this.users)
    
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
    // The card specified must already be assigned if it is not present in unassigned cards
    const cardIsAssigned = this.unassignedCards.indexOf(id) === -1
    
    let cardId;
    // Pick a card randomly if the specified id is taken or not present.
    if (!id || cardIsAssigned) {
      cardId = randomFromArray(this.unassignedCards) || -1;
    } else {
      // Otherwise, just assign using the given id.
      cardId = id
    }
    console.log(this.unassignedCards[cardId])
    
    // Cache the user for if the pack is changed
    if (!this.users[user.id]) this.users[user.id] = user;

    user.assignCard(cardId)
    
    if (cardId === -1) { //a card couldn't be found
      this.alertNotEnoughCards();
    }
  }
  
  alertNotEnoughCards() {
    this.notEnoughCards = true;
    
    //Send something to the client to alert them not enough cards are present
  }
}

export default CardManager;