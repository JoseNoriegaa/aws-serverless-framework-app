declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AWS_S3_BUCKET_NAME: string;
      IS_OFFLINE: string;
      SECRET_KEY: string;
    }
  }
}

export {};
