// External dependencies
import { paginateScan } from "@aws-sdk/client-dynamodb";
import type { APIGatewayProxyResultV2 } from "aws-lambda";

// Internal dependencies
import { PAGINATION_SIZE } from "../../constants";
import dynamodb from "../../lib/dynamodb";
import type { IEvent } from '../../types/api-gateway';
import type { IPaginator,IUserModel } from "../../types/dynamodb";
import unwrapTypes from "../../utils/unwrapTypes";

const handler = async (event: IEvent<never, { lastKey?: string }>): Promise<APIGatewayProxyResultV2> => {
  const lastKeyQuery = event.queryStringParameters?.lastKey;

  const paginator = paginateScan({
    client: dynamodb,
    pageSize: PAGINATION_SIZE,
    startingToken: lastKeyQuery ? { pk: { S: lastKeyQuery } } : undefined,
  }, {
    TableName: 'usersTable',
    ProjectionExpression: 'pk,firstName,lastName,createdAt,updatedAt',
  }) as IPaginator<IUserModel>;

  const page = await paginator.next();
  
  await paginator.return(undefined);

  const items = (page.value?.Items || []).map(unwrapTypes);

  const response = {
    lastKey: items[items.length - 1]?.pk,
    pageSize: PAGINATION_SIZE,
    count: items.length,
    items,
  }

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };;
};

export default handler;
