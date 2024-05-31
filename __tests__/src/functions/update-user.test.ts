// External dependencies
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import MockDate from 'mockdate';

// Internal dependencies
import { handler } from '../../../src/functions/update-user';
import unwrapTypes from '../../../src/utils/unwrapTypes';
import { USERS_MOCK } from '../../mocks';

// Types & Interfaces
type Event = Parameters<typeof handler>[0];

// Mocks
const mockGetCommand = jest.fn();
const mockPutCommand = jest.fn();
jest.mock('@aws-sdk/client-dynamodb', () => {
  const og = jest.requireActual('@aws-sdk/client-dynamodb');

  function Mock1(...args: unknown[]) {
    mockGetCommand(...args);
    return new og.GetItemCommand(...args);
  }
  Mock1.prototype = og.GetItemCommand.prototype;
  
  function Mock2(...args: unknown[]) {
    mockPutCommand(...args);
    return new og.PutItemCommand(...args);
  }
  Mock2.prototype = og.PutItemCommand.prototype;

  return {
    __esModule: true,
    ...og,
    GetItemCommand: Mock1,
    PutItemCommand: Mock2,
  };
});

const ddb = mockClient(DynamoDBClient);

describe('λ - update-user', () => {
  beforeAll(() => {
    MockDate.set('2024-02-01T01:00:00.000Z');
  });

  test('given a valid input and a user id, it should update and return the user information', async () => {
    const userId = USERS_MOCK[0].pk.S;

    const input = {
      firstName: 'Juan',
      lastName: 'Dominguez',
    };

    const expectedItem = {
      likes: { N: USERS_MOCK[0].likes.N },
      createdAt: { S: USERS_MOCK[0].createdAt.S },
      pk: { S: userId },
      firstName: {
        S: input.firstName,
      },
      lastName: {
        S: input.lastName,
      },
      updatedAt: { S: '2024-02-01T01:00:00.000Z' },
    };

    ddb
      .on(GetItemCommand)
      .resolves({
        Item: { likes: USERS_MOCK[0].likes, createdAt: USERS_MOCK[0].createdAt },
      });

    const event = {
      body: JSON.stringify(input),
      pathParameters: { id: userId }
    } as Event;

    const response = await handler(event);

    expect(mockGetCommand).toHaveBeenCalledWith({
      Key: { pk: { S: userId }},
      TableName: 'usersTable',
      AttributesToGet: ['likes', 'createdAt'],
    });

    expect(mockPutCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: 'usersTable',
        Item: expectedItem,
      }),
    );

    expect(response).toStrictEqual({
      statusCode: 200,
      body: JSON.stringify(unwrapTypes(expectedItem))
    });
  });

  test('given a invalid user id, it should return a 404 response', async () => {
    ddb
      .on(GetItemCommand)
      .resolves({
        Item: undefined,
      });

    const event = {
      body: JSON.stringify({}),
      pathParameters: { id: 'non-existing' }
    } as Event;

    const response = await handler(event);

    expect(response).toStrictEqual({
      statusCode: 404,
      body: JSON.stringify({
        detail: `User with ID 'non-existing' was not found.`
      })
    });
  });
});
