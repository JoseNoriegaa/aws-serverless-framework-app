// External dependencies
import { DeleteItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";

// Internal dependencies
import dynamodb from "../../lib/dynamodb";
import type { IEvent } from "../../types/api-gateway";
import unwrapTypes from "../../utils/unwrapTypes";

const handler = async (event: IEvent<{ id: string }>) => {
  const userId = event.pathParameters.id;

  const findCommand = new GetItemCommand({
    TableName: 'usersTable',
    Key: { pk: { S: userId } },
    AttributesToGet: ['pk','firstName','lastName','createdAt','updatedAt'],
  });
  
  const findResponse = await dynamodb.send(findCommand);

  const item = findResponse.Item;
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
