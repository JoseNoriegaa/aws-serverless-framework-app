// External dependencies
import { DynamoDBClient, paginateScan } from "@aws-sdk/client-dynamodb";
import { mockClient } from 'aws-sdk-client-mock';

// Internal dependencies
import { handler } from "../../../src/functions/get-users";
import type { IUserModel } from "../../../src/types/dynamodb";
import { UNWRAPPED_USERS_MOCK, USERS_MOCK } from "../../mocks";

// Types & Interfaces
type Event = Parameters<typeof handler>[0];

// Mocks
mockClient(DynamoDBClient);

jest.mock('@aws-sdk/client-dynamodb', () => {
  const og = jest.requireActual('@aws-sdk/client-dynamodb');

  return {
    __esModule: true,
    ...og,
    paginateScan: jest.fn(),
  };
});

const paginateScanMock = paginateScan as jest.Mock;

async function *makePaginateScanResult(items: IUserModel[], pageSize: number, lastKey?: string) {
  let start = 0;
  if (lastKey) {
    start = items.findIndex(x => x.pk.S === lastKey) + 1;
  }

  for (let idx = start; idx < items.length; idx++) {
    const page = items.slice(idx, idx + pageSize);

    const nextIdx = idx + page.length - 1;
    const response = {
      ScannedCount: page.length,
      Count: page.length,
      Items: page,
      LastEvaluatedKey: { pk: page[page.length - 1].pk }
    };

    if (nextIdx >= items.length) {
      return response;
    }
    
    yield response;
    idx = nextIdx;
  }

  return {
    ScannedCount: 0,
    Count: 0,
    Items: [],
    LastEvaluatedKey: undefined,
  };
}

describe('λ - get-users', () => {
  test('should return the list of users', async () => {
    const pageSize = 10;
    paginateScanMock.mockReturnValue(makePaginateScanResult(USERS_MOCK, pageSize));

    const event = {} as Event;
    const response = await handler(event);

    expect(paginateScanMock).toHaveBeenCalledWith(
      {
        client: expect.any(DynamoDBClient),
        pageSize: pageSize,
        startingToken: undefined,
      }, {
        TableName: 'usersTable',
        ProjectionExpression: 'pk,firstName,lastName,likes,createdAt,updatedAt',
      }
    );

    const expectedItems = UNWRAPPED_USERS_MOCK.slice(0, pageSize);
    const body = {
      lastKey: expectedItems[expectedItems.length - 1].pk,
      pageSize: pageSize,
      count: 10,
      items: expectedItems,
    };

    expect(response).toStrictEqual({
      statusCode: 200,
      body: JSON.stringify(body),
    });
  });

  it('should return the list of users after the provided key - pagination', async () => {
    const pageSize = 10;
    const event = {
      queryStringParameters: { lastKey: '9' },
    } as Event;

    paginateScanMock.mockReturnValue(makePaginateScanResult(USERS_MOCK, pageSize, event.queryStringParameters.lastKey));

    const response = await handler(event);

    expect(paginateScanMock).toHaveBeenCalledWith(
      {
        client: expect.any(DynamoDBClient),
        pageSize: pageSize,
        startingToken: { pk: { S: event.queryStringParameters.lastKey }},
      }, {
        TableName: 'usersTable',
        ProjectionExpression: 'pk,firstName,lastName,likes,createdAt,updatedAt',
      }
    );

    const expectedItems = UNWRAPPED_USERS_MOCK.slice(pageSize, pageSize * 2);
    
    const body = {
      lastKey: expectedItems[expectedItems.length - 1].pk,
      pageSize: pageSize,
      count: 5,
      items: expectedItems,
    };

    expect(response).toStrictEqual({
      statusCode: 200,
      body: JSON.stringify(body),
    });
  });

  it('should return an empty response where are no items', async () => {
    const pageSize = 10;
    const event = {} as Event;

    async function *emptyRes() {
      yield undefined;
    }

    paginateScanMock.mockReturnValue(emptyRes());

    const body = {
      lastKey: undefined,
      pageSize: pageSize,
      count: 0,
      items: [],
    };

    const response = await handler(event);

    expect(response).toStrictEqual({
      statusCode: 200,
      body: JSON.stringify(body),
    });
  });
});
