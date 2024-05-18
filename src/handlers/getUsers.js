// External dependencies
const { paginateScan } = require("@aws-sdk/client-dynamodb");

// Internal dependencies
const { unwrapTypes } = require('../utils/unwrapTypes');
const dynamoDB = require("../lib/dbclient");
const { PAGINATION_SIZE } = require("../constants");


const handler = async (event, context) => {
  const lastKeyQuery = event.queryStringParameters?.lastKey;

  const paginator = paginateScan({
    client: dynamoDB,
    pageSize: PAGINATION_SIZE,
    startingToken: lastKeyQuery ? { pk: { S: lastKeyQuery } } : undefined,
  }, {
    TableName: 'usersTable',
    ProjectionExpression: 'pk,firstName,lastName,createdAt,updatedAt',
  });
  
  const page = await paginator.next()
  await paginator.return();
  const lastKey = page.done ? null : unwrapTypes({...page.value.LastEvaluatedKey}).pk;

  const items = unwrapTypes(page.value?.Items || [])

  const response = {
    lastKey,
    pageSize: PAGINATION_SIZE,
    count: items.length,
    items,
  }

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
}

module.exports = { handler };
