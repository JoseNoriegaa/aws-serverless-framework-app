// External dependencies
import { PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import * as yup from 'yup';

// Internal dependencies
import dynamodb from '../../lib/dynamodb';
import type { IEvent } from '../../types/api-gateway';
import isValidBodyObject from '../../utils/isValidBodyObject';
import unwrapTypes from '../../utils/unwrapTypes';
import formatYupError from '../../utils/yup';

// Constants
const SCHEMA = yup.object({
  firstName: yup.string().min(2).required(),
  lastName: yup.string().min(2).required(),
}).required();

const handler = async (event: IEvent<{ id: string }>) => {
  const userId = event.pathParameters.id;

  let body = JSON.parse(event.body!);
  if (!isValidBodyObject(body)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ detail: 'No data was provided' })
    }
  }
  
  try {
    body = await SCHEMA.validate(body, {
      abortEarly: false,
      strict: true,
    });
  } catch (error) {
    console.log(error);
    return {
      statusCode: 400,
      body: JSON.stringify(formatYupError(error as yup.ValidationError)),
    };
  }

  const findCommand = new QueryCommand({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: {
      ":pk": { S: userId },
    },
    ProjectionExpression: 'createdAt',
    TableName: "usersTable",
  });
  
  const response = await dynamodb.send(findCommand);

  const [item] = response.Items || [];
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
