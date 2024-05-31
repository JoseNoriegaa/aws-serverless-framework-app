// External dependencies
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { APIGatewayProxyResultV2 } from 'aws-lambda';

// Internal dependencies
import { AWS_S3_BUCKET_NAME } from '../../constants';
import s3 from "../../lib/s3";
import type { IEvent } from "../../types/api-gateway";

// Types & Interfaces
interface IBody {
  filename: string;
}

const handler = async (event: IEvent): Promise<APIGatewayProxyResultV2> => {
  const { filename } = JSON.parse(event.body!) as IBody;

  const command = new PutObjectCommand({
    Key: `upload/${filename}`,
    Bucket: AWS_S3_BUCKET_NAME,
    ContentType: 'image/*'
  });

  const url = await getSignedUrl(
    s3,
    command,
    {
      expiresIn: 60 * 5, // 5 minutes$
    },
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ url })
  };
};

export default handler;
