// External dependencies
const { QueryCommand } = require("@aws-sdk/client-dynamodb");

// Internal dependencies
const dynamoDB = require("../lib/dbclient");
const { unwrapTypes } = require("../utils/unwrapTypes");

const handler = async (event, context) => {
  const userId = event.pathParameters.id;

  const command = new QueryCommand({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: {
      ":pk": { S: userId },
    },
    ProjectionExpression: 'pk,firstName,lastName,createdAt,updatedAt',
    TableName: "usersTable",
  });

  const response = await dynamoDB.send(command);

  const [item] = unwrapTypes(response.Items || []);

  return {
    statusCode: item ? 200 : 404,
    body: JSON.stringify(item || { detail: `User with ID '${userId}' was not found.` }),
  };
};

module.exports = { handler };
