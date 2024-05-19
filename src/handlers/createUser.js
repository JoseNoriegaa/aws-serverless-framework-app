// Built-in dependencies
const crypto = require('crypto');

// External dependencies
const { PutItemCommand } = require('@aws-sdk/client-dynamodb');
const yup = require('yup');

// Internal dependencies
const { formatError } = require('../lib/yup');
const dynamoDB = require('../lib/dbclient');
const { unwrapTypes } = require('../utils/unwrapTypes');

// Constants
const SCHEMA = yup.object({
  firstName: yup.string().required().min(2),
  lastName: yup.string().required().min(2),
}).required();

const handler = async (event, context) => {
  let body;
  try {
    console.log(JSON.parse(event.body));
    body = await SCHEMA.validate(JSON.parse(event.body), {
      abortEarly: false,
      strict: true,
    });
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify(formatError(error)),
    };
  }

  const timestamp = new Date().toISOString();
  
  const pk = crypto.randomUUID();
  const user = {
    pk: {
      S: pk,
    },
    firstName: {
      S: body.firstName,
    },
    lastName: {
      S: body.lastName,
    },
    createdAt: {
      S: timestamp,
    },
    updatedAt: {
      S: timestamp,
    },
  };

  const command = new PutItemCommand({
    TableName: 'usersTable',
    Item: user,
  });

  await dynamoDB.send(command);

  return {
    statusCode: 200,
    body: JSON.stringify(unwrapTypes(user))
  };
};

module.exports = { handler };
