// External dependencies
import type { SQSEvent } from "aws-lambda";

const handler = async (event: SQSEvent) => {
  console.log(event);
}

export default handler;
