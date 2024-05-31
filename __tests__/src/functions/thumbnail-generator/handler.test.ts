// External dependencies
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { sdkStreamMixin } from '@smithy/util-stream';
import { mockClient } from 'aws-sdk-client-mock';
import sharp from 'sharp';
import { Readable } from 'stream';

// Internal dependencies
import { handler } from '../../../../src/functions/thumbnail-generator';

// Types & Interfaces
type Event = Parameters<typeof handler>[0];

// Mocks
jest.mock('sharp');
const eventMock = {
  Records: [
    {
      s3: {
        bucket: {
          name: 'bucket',
        },
        object: {
          key: 'upload/image.png',
        },
      },
    },
  ],
} as Event;

const sharpMock = sharp as unknown as jest.Mock;
const s3 = mockClient(S3Client);

describe('λ - thumbnail-generator', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    sharpMock.mockImplementation(() => ({
      resize: jest.fn(() => ({
        toBuffer: () => Promise.resolve('buffer'),
      })),
    }));
  });

  it('should log an error if the given file is not valid', async () => {
    await handler({
      Records: [
        {
          s3: {
            bucket: {
              name: 'bucket',
            },
            object: {
              key: 'random name',
            },
          }
        }
      ]
    } as Event);

    expect(console.error).toHaveBeenCalledWith('Could not determine the image type');
  });

  it('should log an error if we cannot get the image', async () => {
    const error = new Error('Something went wrong');

    s3.on(GetObjectCommand).rejects(error);

    await handler(eventMock);

    expect(console.error).toHaveBeenCalledWith(error);
  });

  it('should log an error if file is not an image', async () => {
    await handler({
      Records: [
        {
          s3: {
            bucket: {
              name: 'bucket',
            },
            object: {
              key: 'doc.pdf',
            },
          }
        }
      ]
    } as Event);

    expect(console.error).toHaveBeenCalledWith('Unsupported image type: pdf');
  });

  it('should resize the image provided by the sqs event', async () => {
    const stream = new Readable();
    stream.push('hello world');
    stream.push(null);

    const sdkStream = sdkStreamMixin(stream);

    s3.on(GetObjectCommand).resolves({
      // @ts-expect-error type relationship is enough for this use case
      Body: sdkStream
    });

    await await handler(eventMock);

    [50, 100, 200].forEach((size) => {
      expect(console.log).toHaveBeenCalledWith(`Successfully resized bucket/upload/image.png and uploaded to bucket/resized/${size}-image.png`);
    });
  });
});
