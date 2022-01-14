
const clamp = (n,min,max) => Math.max(Math.min(n, max), min)

class Config {
  constructor(configData={}) {
    this.settings = configData
  }
  
  set(configName, value) {
    const configItem = this.settings[configName];
    
    let newValue;
    switch(configItem.type) {
      case 'number':
        if (typeof(value) !== 'number') throw Error('Number config cannot be set to anything other than a number!');
        newValue = clamp(value, configItem.min, configItem.max)
        break;
        
      default:
        newValue = value
        break;
    }
    
    configItem.value = newValue;
  }
  
  get(configName) {
    return this.configName.value
  }
}

module.exports = Config;