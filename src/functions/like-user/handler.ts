// External dependencies
import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import type { SQSEvent } from "aws-lambda";

// Internal dependencies
import dynamodb from "../../lib/dynamodb";

// Types & Interfaces
interface IBody {
  id: string;
}

const handler = async (event: SQSEvent) => {
  const body = JSON.parse(event.Records[0].body) as IBody;
  const { id } = body;

  console.log(`target user "${id}"`);
  const command = new UpdateItemCommand({
    TableName: 'usersTable',
    Key: { pk: { S: id } },
    UpdateExpression: 'ADD likes :num',
    ExpressionAttributeValues: {
      ':num': { N: '1' },
    },
    ReturnValues: 'ALL_NEW'
  });

  await dynamodb.send(command);
};

export default handler;
