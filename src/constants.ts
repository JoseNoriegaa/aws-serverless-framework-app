export const IS_OFFLINE = process.env.IS_OFFLINE;
export const PAGINATION_SIZE = 10;
export const AWS_S3_BUCKET_NAME = IS_OFFLINE ? "local-bucket" : process.env.AWS_S3_BUCKET_NAME;
