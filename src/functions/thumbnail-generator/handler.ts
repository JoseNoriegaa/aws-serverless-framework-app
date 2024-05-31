// External dependencies
import type { GetObjectCommandOutput } from "@aws-sdk/client-s3";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from 'sharp';

// Internal dependencies
import s3 from "../../lib/s3";
import type { IEvent } from "../../types/api-gateway";

// Types & Interfaces
interface BucketEvent extends IEvent {
  Records: {
    s3: {
      bucket: {
        name: string;
      };
      object: {
        key: string;
      }
    }
  }[];
}

// Constants
const ALLOWED_IMAGE_TYPES = ['png', 'jpg', 'jpeg'];

// Utils
const resizer = async (body: Uint8Array, size: number, bucket: string, key: string, ext: string) => {
  const filename = key.split('/')[1];
  const resizedFilename = `resized/${size}-${filename}`;
  let buffer;
  try {
    buffer = await sharp(body).resize(size).toBuffer();
  } catch (error) {
    console.error(error);
    return;
  }

  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: resizedFilename,
      Body: buffer,
      ContentType: `image/${ext}`,
    });

    await s3.send(command);
  } catch (error) {
    console.error(error);
    return;
  }

  console.log(`Successfully resized ${bucket}/${key} and uploaded to ${bucket}/${resizedFilename}`);
};

// Handler
const handler = async (event: BucketEvent): Promise<void> => {
  const srcBucket = event.Records[0].s3.bucket.name;
  const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
  const typeMatch = srcKey.match(/\.([^.]*)$/);
  if (!typeMatch) {
    console.error('Could not determine the image type');
    return;
  }

  const imageType = typeMatch[1].toLowerCase();
  if (!ALLOWED_IMAGE_TYPES.includes(imageType)) {
    console.error(`Unsupported image type: ${imageType}`);
    return;
  }

  let originalImage: GetObjectCommandOutput;
  try {
    const command = new GetObjectCommand({
      Bucket: srcBucket,
      Key: srcKey,
    });

    originalImage = await s3.send(command);
  } catch (error) {
    console.error(error);
    return;
  }

  const widths = [50,100,200];
  const byteArray = await originalImage.Body!.transformToByteArray();

  await Promise.all(widths.map(width => resizer(byteArray, width, srcBucket, srcKey, imageType)));
};

export { resizer };
export default handler;
