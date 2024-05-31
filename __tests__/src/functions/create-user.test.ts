// External dependencies
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import crypto from 'crypto';
import MockDate from 'mockdate';

// Internal dependencies
import { handler } from '../../../src/functions/create-user';
import unwrapTypes from '../../../src/utils/unwrapTypes';

// Types & Interfaces
type Event = Parameters<typeof handler>[0];

// Mocks
const mockCommand = jest.fn();
jest.mock('@aws-sdk/client-dynamodb', () => {
  const og = jest.requireActual('@aws-sdk/client-dynamodb');

  function Mock(...args: unknown[]) {
    mockCommand(...args);
    return new og.PutItemCommand(...args);
  }
  Mock.prototype = og.PutItemCommand.prototype;

  return {
    __esModule: true,
    ...og,
    PutItemCommand: Mock,
  };
});

mockClient(DynamoDBClient);

const uuidMock = jest.spyOn(crypto, 'randomUUID');

describe('λ - create-user', () => {
  beforeAll(() => {
    MockDate.set('2024-01-01T01:00:00.000Z');
    uuidMock.mockReturnValue('0-0-0-0-0');
  });

  test('given a valid input, it should create an return a user record', async () => {
    const event = {
      body: JSON.stringify({
        firstName: 'John',
        lastName: 'Doe',
      }),
    } as Event;

    const response = await handler(event);

    const expectedItem = {
      pk: { S: '0-0-0-0-0' },
      firstName: { S: 'John' },
      lastName: { S: 'Doe' },
      likes: { N: '0' },
      createdAt: { S: '2024-01-01T01:00:00.000Z' },
      updatedAt: { S: '2024-01-01T01:00:00.000Z' },
    };

    expect(mockCommand).toHaveBeenCalledWith(({
      TableName: 'usersTable',
      Item: expectedItem,
    }));

    expect(response).toStrictEqual({
      statusCode: 201,
      body: JSON.stringify(unwrapTypes(expectedItem))
    });
  });
});
