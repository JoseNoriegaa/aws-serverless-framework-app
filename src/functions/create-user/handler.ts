
// External dependencies
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import type { APIGatewayProxyResultV2 } from "aws-lambda";
import { randomUUID } from 'crypto';

// Internal dependencies
import dynamodb from "../../lib/dynamodb";
import type { IEvent } from "../../types/api-gateway";
import unwrapTypes from "../../utils/unwrapTypes";

// Types & Interfaces
interface IBody {
  firstName: string;
  lastName: string;
}

// Constants
const handler = async (event: IEvent): Promise<APIGatewayProxyResultV2> => {
  const body = JSON.parse(event.body!) as IBody;
  
  const timestamp = new Date().toISOString();
  
  const pk = randomUUID();
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

  await dynamodb.send(command);

  return {
    statusCode: 201,
    body: JSON.stringify(unwrapTypes(user))
  };
};

export default handler;
