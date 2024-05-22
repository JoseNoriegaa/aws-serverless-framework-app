// External dependencies
import { DynamoDBClient, type DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";

// Internal dependencies
import { IS_OFFLINE } from "../constants";

const params: DynamoDBClientConfig = Object.freeze(IS_OFFLINE ? {
  region: 'localhost',
  endpoint: 'http://0.0.0.0:8000'
} : {});

const dynamodb = new DynamoDBClient(params);

export default dynamodb;
