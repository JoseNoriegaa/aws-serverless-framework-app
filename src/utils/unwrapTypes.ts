// External dependencies
import type { AttributeValue } from "@aws-sdk/client-dynamodb";

// Types & Interfaces
type UnwrapType<T> = {
  [K in keyof T]: T[K][keyof T[K]]
}

type DynamoResultLike = Record<string, AttributeValue>;

const unwrapTypes = <T extends DynamoResultLike>(item: T) => {

  const keys = Object.keys(item) as (keyof T)[];

  const output = {} as Record<keyof T, unknown>;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const subKeys = Object.keys(item[key]) as (keyof AttributeValue)[];
    const subKey = subKeys[0];

    const value = item[key][subKey];
    output[key] = value;
  }

  return output as UnwrapType<T>;
}

export default unwrapTypes;
