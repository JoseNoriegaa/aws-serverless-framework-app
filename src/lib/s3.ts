// External dependencies
import { S3Client, type S3ClientConfig } from "@aws-sdk/client-s3";

/* istanbul ignore next */
const params: S3ClientConfig = Object.freeze({});

const s3 = new S3Client(params);

export default s3;
