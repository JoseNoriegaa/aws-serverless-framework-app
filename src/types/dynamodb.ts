// External dependencies
import type { AttributeValue, QueryOutput, ScanCommandOutput } from '@aws-sdk/client-dynamodb';

interface IUserModel extends Record<string, AttributeValue> {
  pk: { S: string };
  firstName: { S: string };
  lastName: { S: string };
  likes: { N: string };
  createdAt: { S: string };
  updatedAt: { S: string };
}

type IScanResult<T = unknown> = Omit<ScanCommandOutput, 'Items' | 'LastEvaluatedKey'> & {
  Items?: T[];
  LastEvaluatedKey?: { pk: { S: string } };
}

type IQueryResult<
  T extends Record<string, AttributeValue> = never
> = Omit<QueryOutput, 'Items'> & {
  Items?: T[]
}

type IPaginator<T> = AsyncGenerator<IScanResult<T>, undefined, undefined>;

type UnwrapType<T> = {
  [K in keyof T]: T[K][keyof T[K]]
}

export type {
  IPaginator,
  IQueryResult,
  IScanResult,
  IUserModel,
  UnwrapType,
}
