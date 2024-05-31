// External dependencies
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { mockClient } from 'aws-sdk-client-mock';

// Internal dependencies
import { handler } from "../../../src/functions/get-user";
import { UNWRAPPED_USERS_MOCK, USERS_MOCK } from "../../mocks";

// Types & Interfaces
type Event = Parameters<typeof handler>[0];

// Mocks
const ddb = mockClient(DynamoDBClient);

describe('λ - get-user', () => {
  beforeEach(() => {
    ddb.on(GetItemCommand).resolves({
      Item: USERS_MOCK[0],
    });
  });

  test('given a valid user id, it should return the related user information', async () => {
    const event = {
      pathParameters: { id: USERS_MOCK[0].pk.S }
    } as Event;

    const response = await handler(event);

    expect(response).toStrictEqual({
      statusCode: 200,
      body: JSON.stringify(UNWRAPPED_USERS_MOCK[0]),
    });
  });

  test('given an invalid user id, it should return a 404 response', async () => {
    ddb.on(GetItemCommand).resolves({ Item: undefined });

    const event = {
      pathParameters: { id: 'unexpected-id' }
    } as Event;

    const response = await handler(event);

    expect(response).toStrictEqual({
      statusCode: 404,
      body: JSON.stringify({ detail: `User with ID 'unexpected-id' was not found.` }),
    });
  });
});
