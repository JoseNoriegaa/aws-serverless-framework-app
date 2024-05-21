// External dependencies
import { DeleteItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";

// Internal dependencies
import dynamodb from "../../lib/dynamodb";
import type { IEvent } from "../../types/api-gateway";
import type { IQueryResult,IUserModel } from "../../types/dynamodb";
import unwrapTypes from "../../utils/unwrapTypes";

const handler = async (event: IEvent<{ id: string }>) => {
  const userId = event.pathParameters.id;

  const findCommand = new QueryCommand({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: {
      ":pk": { S: userId },
    },
    ProjectionExpression: 'pk,firstName,lastName,createdAt,updatedAt',
    TableName: "usersTable",
  });
  
  const findResponse = (await dynamodb.send(findCommand)) as IQueryResult<IUserModel>;

  const [item] = findResponse.Items || [];
  if (!item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ detail: `User with ID '${userId}' was not found.` })
    };
  }

  const command = new DeleteItemCommand({
    TableName: 'usersTable',
    Key: { pk: { S: userId } },
    ReturnValues: 'NONE',
  });

  await dynamodb.send(command);

  return {
    statusCode: 200,
    body: JSON.stringify(unwrapTypes(item)),
  };
};

export default handler;
