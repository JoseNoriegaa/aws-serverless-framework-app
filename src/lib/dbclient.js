// External dependencies
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

// Internal dependencies
const { IS_OFFLINE } = require("../constants");

/**
 * @type {import('@aws-sdk/client-dynamodb').DynamoDBClientConfig}
 */
const dbParams = IS_OFFLINE
  ? {
      region: "localhost",
      endpoint: "http://0.0.0.0:8000",
    }
  : {};

const dynamoDB = new DynamoDBClient(dbParams);

module.exports = dynamoDB;
