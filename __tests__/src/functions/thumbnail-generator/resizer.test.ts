// External dependencies
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import sharp from 'sharp';

// Internal dependencies
import { resizer } from '../../../../src/functions/thumbnail-generator/handler';

// Mocks
jest.mock('sharp');

const mockPutCommand = jest.fn();
jest.mock('@aws-sdk/client-s3', () => {
  const og = jest.requireActual('@aws-sdk/client-s3');

  function Mock(...args: unknown[]) {
    mockPutCommand(...args);
    return new og.PutObjectCommand(...args);
  }

  Mock.prototype = og.PutObjectCommand.prototype;

  return {
    __esModule: true,
    ...og,
    PutObjectCommand: Mock,
  };
});

const s3 = mockClient(S3Client);
const sharpMock = sharp as unknown as jest.Mock;

describe('resizer', () => {
  beforeEach(() => {
    s3.on(PutObjectCommand).resolves({
      ETag: '1',
    });

    sharpMock.mockImplementation(() => ({
      resize: () => ({
        toBuffer: jest.fn(() => 'buffer'),
      }),
    }));
  });

  it('should resize and save the provided image', async () => {
    await resizer(
      new Uint8Array(),
      10,
      'bucket',
      'upload/image.png',
      'png'
    );

    expect(mockPutCommand).toHaveBeenCalledWith(expect.objectContaining({
      Bucket: 'bucket',
      Key: 'resized/10-image.png',
      Body: 'buffer',
      ContentType: `image/png`,
    }));

    expect(console.log).toHaveBeenCalledWith('Successfully resized bucket/upload/image.png and uploaded to bucket/resized/10-image.png');
  });

  it('should log an error if fails to upload the image', async () => {
    const error = new Error('Network Error');
    s3.on(PutObjectCommand).rejects(error);

    await resizer(
      new Uint8Array(),
      10,
      'bucket',
      'upload/image.png',
      'png'
    );

    expect(console.error).toHaveBeenCalledWith(error);
  });

  it('should log an error if fails to resize the image', async () => {
    const error = new Error('Invalid input');
    sharpMock.mockImplementation(() => {throw error;});

    await resizer(
      new Uint8Array(),
      10,
      'bucket',
      'upload/image.png',
      'png'
    );

    expect(console.error).toHaveBeenCalledWith(error);
  });
});
