// External dependencies
import type { AttributeValue, QueryOutput, ScanCommandOutput } from '@aws-sdk/client-dynamodb';

interface IUserModel extends Record<string, AttributeValue> {
  pk: { S: string };
  firstName: { S: string };
  lastName: { S: string };
  createdAt: { S: string };
  updatedAt: { S: string };
}

type ScanResult<T = unknown> = Omit<ScanCommandOutput, 'Items' | 'LastEvaluatedKey'> & {
  Items?: T[];
  LastEvaluatedKey?: { pk: { S: string } };
}

type QueryResult<
  T extends Record<string, AttributeValue> = never
> = Omit<QueryOutput, 'Items'> & {
  Items?: T[]
}

type Paginator<T> = AsyncGenerator<ScanResult<T>, undefined, undefined>;

export type {
  IUserModel,
  Paginator,
  QueryResult,
  ScanResult,
}
