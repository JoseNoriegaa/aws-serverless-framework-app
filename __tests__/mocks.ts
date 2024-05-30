// External dependencies
import { IUserModel, UnwrapType } from "../src/types/dynamodb";
import unwrapTypes from "../src/utils/unwrapTypes";

const USERS_MOCK = Array.from({ length: 15 }).map<IUserModel>((_, idx) => ({
  pk: { S: idx.toString() },
  firstName: { S: 'John' },
  lastName: { S: 'Doe' },
  likes: { N: '1' },
  createdAt: { S: '2024-01-01T01:01:01' },
  updatedAt: { S: '2024-01-01T01:01:01' }
}));

const UNWRAPPED_USERS_MOCK = USERS_MOCK.map(unwrapTypes);

export {
  USERS_MOCK,
  UNWRAPPED_USERS_MOCK,
};
