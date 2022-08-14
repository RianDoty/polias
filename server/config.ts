const clamp = (n: number, min: number, max: number) =>
  Math.max(Math.min(n, max), min);

type ConfigEntry =
  | {
      type: "number";
      value: number;
      min: number;
      max: number;
    }
  | {
      type: "string";
      value: string;
    };

export type ConfigData = { [key: string]: ConfigEntry };

class ConfigTrash<C extends ConfigData> {
  settings: C;

  constructor(configData: C) {
    this.settings = configData;
  }

  set<K extends keyof C>(configName: K, value: C[K]["value"]) {
    const configItem = this.settings[configName];
    if (!configItem) throw Error(`Invalid config item: ${configName}`);
    switch (configItem.type) {
      case "number":
        if (typeof value !== "number")
          throw Error(
            "Number config cannot be set to anything other than a number!"
          );
        configItem.value = clamp(value, configItem.min, configItem.max);
        break;

      case "string":
        if (typeof value !== "string")
          throw Error(
            "String config cannot be set to a value other than a string!"
          );
        configItem.value = value;
        break;
    }
  }

  get(configName: string) {
    return this.settings[configName].value;
  }
}

interface ConfigConstraints {
  [key: string]:
    | {
        default: number;
        min?: number;
        max?: number;
      }
    | {
        default: string;
      };
}

class Config extends Map {
  constructor(constraints: ConfigConstraints) {
    super();
    Object.entries(constraints).forEach((k, v) => {});
  }
}

export default Config;
