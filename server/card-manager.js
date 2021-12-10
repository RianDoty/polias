const avatars = require('../src/components/game/avatars')

function randomFromTable(tbl) {
  const values = Object.entries(tbl);
  const randomIndex = Math.floor(Math.random() * values.length);
  
  return values[randomIndex] //[key, value]
}
class CardManager {
  constructor() {
    const [, defaultPack] = randomFromTable(avatars);    
    
    this.assignPack(defaultPack);
  }
  
  assignPack(pack) {
    
  }
}

module.exports = CardManager;