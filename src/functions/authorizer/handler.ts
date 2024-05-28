// External dependencies
import type { APIGatewayTokenAuthorizerEvent, APIGatewayTokenAuthorizerHandler } from "aws-lambda";

// Internal dependencies
import { SECRET_KEY } from "../../constants";

const handler: APIGatewayTokenAuthorizerHandler = async (event: APIGatewayTokenAuthorizerEvent) => {
  const date = new Date();  
  const minutes = date.getMinutes();
  const hour = date.getHours();

  const token = `Bearer ${SECRET_KEY}-${hour}-${minutes}`;

  console.log(token);

  if (event.authorizationToken === token) {
    return {
      principalId: 'anonymous',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn,
          },
        ],
      },
    };
  }

  throw new Error('Unauthorized');
};

export default handler;
