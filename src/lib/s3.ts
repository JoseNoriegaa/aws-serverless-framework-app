// External dependencies
import { S3Client, type S3ClientConfig } from "@aws-sdk/client-s3";

// Internal dependencies
import { IS_OFFLINE } from "../constants";

const params: S3ClientConfig = Object.freeze(
  IS_OFFLINE
    ? {
      forcePathStyle: true,
        credentials: {
          accessKeyId: "S3RVER", // This specific key is required when working offline
          secretAccessKey: "S3RVER",
        },
        endpoint: "http://localhost:4569",
      }
    : {}
);

const s3 = new S3Client(params);

export default s3;
