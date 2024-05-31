// External dependencies
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

// Internal dependencies
import { handler } from "../../../src/functions/like-user";

// Types & Interfaces
type Event = Parameters<typeof handler>[0];

// Mocks
const mockCommand = jest.fn();
jest.mock('@aws-sdk/client-dynamodb', () => {
  const og = jest.requireActual('@aws-sdk/client-dynamodb');
  function Mock(...args: unknown[]) {
    mockCommand(...args);
    return new og.UpdateItemCommand(...args);
  }
  Mock.prototype = og.UpdateItemCommand.prototype;

  return {
    __esModule: true,
    ...og,
    UpdateItemCommand: Mock,
  };
});

const ddb = mockClient(DynamoDBClient);

describe('λ - like-user', () => {
  it('should increment in 1 the likes counter in the user record', async () => {
    ddb.on(UpdateItemCommand).resolves({});

    await handler({
      Records: [
        {
          body: JSON.stringify({
            id: '1'
          }),
        },
      ],
    } as Event);

    expect(mockCommand).toHaveBeenCalledWith(expect.objectContaining({
      TableName: 'usersTable',
      Key: { pk: { S: '1' } },
      UpdateExpression: 'ADD likes :num',
      ExpressionAttributeValues: {
        ':num': { N: '1' },
      },
    }));
  });
});