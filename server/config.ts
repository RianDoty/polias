
const clamp = (n:number,min:number,max:number) => Math.max(Math.min(n, max), min)

export interface ConfigData {
  [key:string]: {
    type: 'number'
    value: number
    min: number
    max: number
  } | {
    type: 'string'
    value: string
  }
}

class Config {
  settings: ConfigData

  constructor(configData={}) {
    this.settings = configData
  }
  
  set(configName:string, value:unknown) {
    const configItem = this.settings[configName];
    
    switch(configItem.type) {
      case 'number':
        if (typeof(value) !== 'number') throw Error('Number config cannot be set to anything other than a number!');
        configItem.value =  clamp(value, configItem.min, configItem.max)
        break;
        
      case 'string':
        if (typeof(value) !== 'string') throw Error('String config cannot be set to a value other than a string!')
        configItem.value = value
        break;
    }
    
    
  }
  
  get(configName: string) {
    return this.settings[configName].value
  }
}

export default Config;