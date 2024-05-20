
// External dependencies
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyResultV2 } from "aws-lambda";
import Crypto from 'crypto';
import * as yup from 'yup';

// Internal dependencies
import dynamodb from "../../lib/dynamodb";
import { IEvent } from "../../types/api-gateway";
import unwrapTypes from "../../utils/unwrapTypes";
import formatYupError from "../../utils/yup";

// Constants
const SCHEMA = yup.object({
  firstName: yup.string().required().min(2),
  lastName: yup.string().required().min(2),
}).required();

const handler = async (event: IEvent): Promise<APIGatewayProxyResultV2> => {
  let body;

  try {
    body = await SCHEMA.validate(JSON.parse(event.body!), {
      abortEarly: false,
      strict: true,
    });
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify(formatYupError(error as yup.ValidationError)),
    };
  }

  
  const timestamp = new Date().toISOString();
  
  const pk = Crypto.randomUUID();
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
