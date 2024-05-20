// External dependencies
import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyResultV2 } from "aws-lambda";

// Internal dependencies
import dynamodb from "../../lib/dynamodb";
import type { IEvent } from "../../types/api-gateway";
import { IUserModel, QueryResult } from "../../types/dynamodb";

const handler = async (event: IEvent<{ id: string }>): Promise<APIGatewayProxyResultV2> => {
  const userId = event.pathParameters.id;

  const command = new QueryCommand({
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': { S: userId },
    },
    ProjectionExpression: 'pk,firstName,lastName,createdAt,updatedAt',
    TableName: 'usersTable',
  });

  const response = await dynamodb.send(command) as QueryResult<IUserModel>;

  const [item] = (response.Items || []);

  if (!item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ detail: `User with ID '${userId}' was not found.` })
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(item),
  };
};

export default handler;
