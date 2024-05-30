// External dependencies
import { S3Client } from "@aws-sdk/client-s3";

// Internal dependencies
import s3 from "../../../src/lib/s3";

describe('s3 client', () => {
  it('should be an instance of S3Client', () => {
    expect(s3 instanceof S3Client).toBeTruthy();
  });
});
