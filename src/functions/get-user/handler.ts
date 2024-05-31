// External dependencies
import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import type { APIGatewayProxyResultV2 } from "aws-lambda";

// Internal dependencies
import dynamodb from "../../lib/dynamodb";
import type { IEvent } from "../../types/api-gateway";
import unwrapTypes from "../../utils/unwrapTypes";

const handler = async (event: IEvent<{ id: string }>): Promise<APIGatewayProxyResultV2> => {
  const userId = event.pathParameters.id;

  const command = new GetItemCommand({
    TableName: 'usersTable',
    Key: { pk: { S: userId } },
    AttributesToGet: ['pk', 'firstName', 'lastName', 'likes', 'createdAt', 'updatedAt'],
  });

  const response = await dynamodb.send(command);

  const item = response.Item;

  if (!item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ detail: `User with ID '${userId}' was not found.` })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(unwrapTypes(item)),
  };
};

export default handler;
