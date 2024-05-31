// External dependencies
import { GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';

// Internal dependencies
import dynamodb from '../../lib/dynamodb';
import type { IEvent } from '../../types/api-gateway';
import unwrapTypes from '../../utils/unwrapTypes';

// Types & Interfaces
interface IBody {
  firstName: string;
  lastName: string;
}

const handler = async (event: IEvent<{ id: string }>) => {
  const userId = event.pathParameters.id;
  const body = JSON.parse(event.body!) as IBody;

  const findCommand = new GetItemCommand({
    TableName: 'usersTable',
    Key: { pk: { S: userId } },
    AttributesToGet: ['likes', 'createdAt'],
  });
  
  const response = await dynamodb.send(findCommand);

  const item = response.Item;
  if (!item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ detail: `User with ID '${userId}' was not found.` })
    };
  }

  const newItem = {
    ...item,
    pk: { S: userId },
    firstName: { S: body.firstName },
    lastName: { S: body.lastName },
    updatedAt: { S: new Date().toISOString() },
  };

  const command = new PutItemCommand({
    TableName: 'usersTable',
    ConditionExpression: 'pk = :pk',
    ReturnValues: 'ALL_OLD',
    ExpressionAttributeValues: {
      ':pk': { S: userId },
    },
    Item: newItem,
  });

  await dynamodb.send(command);
  
  return {
    statusCode: 200,
    body: JSON.stringify(unwrapTypes(newItem)),
  };
};

export default handler;
