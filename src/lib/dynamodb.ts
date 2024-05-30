// External dependencies
import { DynamoDBClient, type DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";

const params: DynamoDBClientConfig = Object.freeze({});

const dynamodb = new DynamoDBClient(params);

export default dynamodb;
