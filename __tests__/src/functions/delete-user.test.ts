// External dependencies
import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

// Internal dependencies
import { handler } from "../../../src/functions/delete-user";
import { UNWRAPPED_USERS_MOCK, USERS_MOCK } from "../../mocks";

// Types & Interfaces
type Event = Parameters<typeof handler>[0];

// Mocks
const mockCommand = jest.fn();
jest.mock('@aws-sdk/client-dynamodb', () => {
  const og = jest.requireActual('@aws-sdk/client-dynamodb');

  function Mock(...args: unknown[]) {
    mockCommand(...args);
    return new og.GetItemCommand(...args);
  }
  Mock.prototype = og.GetItemCommand.prototype;

  return {
    __esModule: true,
    ...og,
    GetItemCommand: Mock,
  };
});

const ddb = mockClient(DynamoDBClient);

describe("λ - delete-user", () => {
  test("given a valid user id, it should return the user information", async () => {
    const userId = USERS_MOCK[0].pk.S;

    ddb
      .on(GetItemCommand)
      .resolves({
        Item: USERS_MOCK[0],
      })
      .on(DeleteItemCommand)
      .resolves({});

    const response = await handler({
      pathParameters: { id: userId },
    } as Event);

    expect(mockCommand).toHaveBeenCalledWith(expect.objectContaining({
      Key: { pk: { S: userId } },
      AttributesToGet: ['pk', 'firstName', 'lastName', 'likes', 'createdAt', 'updatedAt'],
    }));

    expect(response).toStrictEqual({
      statusCode: 200,
      body: JSON.stringify(UNWRAPPED_USERS_MOCK[0]),
    });
  });

  test('given an invalid user id, it should return a 404 response', async () => {
    ddb
      .on(GetItemCommand)
      .resolves({});

    const response = await handler({
      pathParameters: { id: 'not-existing' },
    } as Event);
    
    expect(response).toStrictEqual({
      statusCode: 404,
      body: JSON.stringify({
        detail: `User with ID 'not-existing' was not found.`
      }),
    });
  });
});
