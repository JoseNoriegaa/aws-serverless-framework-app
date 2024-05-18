// External dependencies
const yup = require('yup');

// Internal dependencies
const { formatError } = require('../lib/yup');
const { unwrapTypes } = require('../utils/unwrapTypes');
const { isValidBodyObject } = require('../utils/isValidBodyObject');
const { PutItemCommand, QueryCommand } = require('@aws-sdk/client-dynamodb');
const dynamoDB = require('../lib/dbclient');

// Constants
const SCHEMA = yup.object({
  firstName: yup.string().min(2).required(),
  lastName: yup.string().min(2).required(),
}).required();

const handler = async (event, context) => {
  const userId = event.pathParameters.id;

  let body = JSON.parse(event.body);
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
      body: JSON.stringify(formatError(error)),
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
  
  const response = await dynamoDB.send(findCommand);

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

  await dynamoDB.send(command);
  
  return {
    statusCode: 200,
    body: JSON.stringify(unwrapTypes(newItem)),
  };
};

module.exports = { handler };
