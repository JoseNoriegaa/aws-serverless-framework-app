// External dependencies
const { QueryCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');

// Internal dependencies
const { unwrapTypes } = require('../utils/unwrapTypes');
const dynamoDB = require('../lib/dbclient');


const handler = async (event, context) => {
  const userId = event.pathParameters.id;

  const findCommand = new QueryCommand({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: {
      ":pk": { S: userId },
    },
    ProjectionExpression: 'pk,firstName,lastName,createdAt,updatedAt',
    TableName: "usersTable",
  });
  
  const findResponse = await dynamoDB.send(findCommand);

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

  await dynamoDB.send(command);

  return {
    statusCode: 200,
    body: JSON.stringify(unwrapTypes(item)),
  };
};

module.exports = { handler };
