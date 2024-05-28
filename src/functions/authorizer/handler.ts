// External dependencies
import type { APIGatewayTokenAuthorizerEvent, AuthResponse } from "aws-lambda";

// Internal dependencies
import { SECRET_KEY } from "../../constants";

const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<AuthResponse> => {
  const date = new Date();  
  const minutes = date.getMinutes();
  const hour = date.getHours();

  if (event.authorizationToken === `Bearer ${SECRET_KEY}-${hour}-${minutes}`) {
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
