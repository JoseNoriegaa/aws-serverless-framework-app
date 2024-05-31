// External dependencies
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Internal dependencies
import { handler } from '../../../src/functions/create-signed-upload-url';

// Types & Interfaces
type Event = Parameters<typeof handler>[0];

// Mocks
jest.mock('@aws-sdk/s3-request-presigner', () => {
  return {
    __esModule: true,
    getSignedUrl: jest.fn(),
  };
});

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

const getSignedUrlMock = getSignedUrl as jest.Mock;

const EVENT_MOCK = {
  body: JSON.stringify({
    filename: 'image.png',
  }),
} as Event;

describe('λ - create-signed-upload-url', () => {
  beforeAll(() => {
    getSignedUrlMock.mockReturnValue('signed-url');
  });

  test('given a filename, it should return a s3 signed url', async () => {

    const response = await handler(EVENT_MOCK);

    expect(mockPutCommand).toHaveBeenCalledWith(expect.objectContaining({
      Key: 'upload/image.png',
      ContentType: 'image/*',
    }));

    expect(response).toStrictEqual({
      statusCode: 200,
      body: JSON.stringify({ url: 'signed-url' }),
    });
  });
});
