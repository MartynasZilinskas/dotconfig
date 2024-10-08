export class CircularReferenceError extends Error {
  constructor(public readonly path: string) {
    super("Circular references are not supported.");
  }
}

export type Primitive = string | number | boolean | null | undefined;
export type NestedObject = { [key: string]: unknown };

export interface FlattenOptions {
  delimiter?: string;
  transformKey?: (key: string) => string;
}

export function flatten(target: NestedObject, options: FlattenOptions = {}) {
  const delimiter = options.delimiter ?? ".";
  const transformKey = options.transformKey ?? ((key) => key);
  const result = new Map<string, Primitive>();
  const handledObjects = new WeakSet<NestedObject>();

  const stack: Array<{ obj: NestedObject; prefix: string | null }> = [{ obj: target, prefix: null }];

  while (stack.length > 0) {
    // biome-ignore lint/style/noNonNullAssertion: Check is done in while loop.
    const { obj, prefix } = stack.pop()!;

    for (const key of Object.keys(obj)) {
      const value = obj[key];
      const transformedKey = prefix != null ? prefix + delimiter + transformKey(key) : transformKey(key);

      if (typeof value !== "object" || value === null) {
        result.set(transformedKey, value as Primitive);
      } else if (Object.keys(value).length === 0) {
        //
      } else if (handledObjects.has(value as NestedObject)) {
        throw new CircularReferenceError(transformedKey);
      } else {
        stack.push({ obj: value as NestedObject, prefix: transformedKey });
        handledObjects.add(value as NestedObject);
      }
    }
  }

  return result;
}

function parseKey(key: string | undefined): string | number {
  if (key === undefined) {
    throw new Error("Key cannot be undefined.");
  }

  if (key === "") {
    return key;
  }

  const parsedKey = Number(key);

  if (Number.isNaN(parsedKey) || key.indexOf(".") !== -1) {
    return key;
  }

  return parsedKey;
}

function isEmpty(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object" && value !== null) {
    return Object.keys(value).length === 0;
  }

  return false;
}

export function unflatten(target: Map<string, unknown>, options: FlattenOptions = {}): NestedObject {
  const delimiter = options.delimiter ?? ".";
  const transformKey = options.transformKey ?? ((key) => key);
  const result: NestedObject = {};

  keyFor: for (const [key, value] of target.entries()) {
    const keys = key.split(delimiter).map(transformKey);
    let currentObj = result;

    for (let i = 0; i < keys.length; i++) {
      const currentKey = parseKey(keys[i]);

      if (i === keys.length - 1) {
        currentObj[currentKey] = value;
        continue;
      }

      const nextKey = parseKey(keys[i + 1]);

      if (!(currentKey in currentObj)) {
        currentObj[currentKey] = typeof nextKey === "number" ? [] : {};
      } else if (isEmpty(currentObj[currentKey])) {
        currentObj[currentKey] = typeof nextKey === "number" ? [] : {};
      }

      if (typeof currentObj[currentKey] !== "object") {
        continue keyFor;
      }

      currentObj = currentObj[currentKey] as NestedObject;
    }
  }

  return result;
}
