const clamp = (n: number, min?: number, max?: number) =>
  Math.max(Math.min(n, max || 9999999999), min || -9999999999);

interface BoolConstraint {
  type: "boolean";
  default: boolean;
}

interface StringConstraint {
  type: "string";
  default: string;
}

interface NumberConstraint {
  type: "number";
  default: number;
  min?: number;
  max?: number;
}

type Constraint = BoolConstraint | StringConstraint | NumberConstraint;
type ExpectedType<C extends Constraint> = C["type"] extends "string"
  ? string
  : C["type"] extends "number"
  ? number
  : C["type"] extends "boolean"
  ? boolean
  : never;
type ConstraintData = { [key: string]: Constraint };

class Config<C extends ConstraintData> extends Map {
  private _constraints: C;

  constructor(data: C) {
    super();
    this._constraints = data;
    Object.entries(data).forEach(([k, v]) => {
      super.set(k, v.default);
      Object.seal(v);
    });

    Object.seal(this._constraints);
  }

  private _constrain<C extends Constraint>(
    constraint: C,
    value: ExpectedType<C>
  ): ExpectedType<C> {
    function verify(val: any): val is ExpectedType<C> {
      return typeof val === constraint.type;
    }

    switch (constraint.type) {
      case "number":
        if (typeof value !== "number")
          throw Error(`Expected value to be a number, got: ${value}`);
        const clamped = clamp(value, constraint.min, constraint.max);
        if (!verify(clamped))
          throw Error(
            `Invalid return from clamp: Expected number, got: ${typeof clamped}`
          );
        return clamped;
    }

    return value;
  }

  set<K extends keyof C, V extends ExpectedType<C[K]>>(key: K, value: V): this {
    const constraint = this._constraints[key];

    return super.set(key, this._constrain(constraint, value));
  }

  get<K extends keyof C>(key: K): ExpectedType<C[K]> {
    return super.get(key);
  }
}

export default Config;
