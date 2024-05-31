// External dependencies
import type {
  APIGatewayProxyEventPathParameters,
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayProxyEventV2,
} from "aws-lambda";

type IEvent<
  Path extends APIGatewayProxyEventPathParameters = never,
  Query extends APIGatewayProxyEventQueryStringParameters = never
> = Omit<APIGatewayProxyEventV2, 'queryStringParameters'> & {
  queryStringParameters: Query;
  pathParameters: Path;
};

export type {
  IEvent,
};
