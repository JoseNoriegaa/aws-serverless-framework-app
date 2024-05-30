// External dependencies
import { IUserModel, UnwrapType } from "../src/types/dynamodb";
import unwrapTypes from "../src/utils/unwrapTypes";

const USERS_MOCK: IUserModel[] = [
  {
    pk: { S: '1' },
    firstName: { S: 'John' },
    lastName: { S: 'Doe' },
    likes: { S: '1' },
    createdAt: { S: '2024-01-01T01:01:01' },
    updatedAt: { S: '2024-01-01T01:01:01' },
  },
  {
    pk: { S: '2' },
    firstName: { S: 'Juan' },
    lastName: { S: 'Dominguez' },
    likes: { N: '2' },
    createdAt: { S: '2024-01-01T01:01:01' },
    updatedAt: { S: '2024-01-01T01:01:01' },
  },
];

const UNWRAPPED_USERS_MOCK = USERS_MOCK.map(unwrapTypes);

export {
  USERS_MOCK,
  UNWRAPPED_USERS_MOCK,
};
