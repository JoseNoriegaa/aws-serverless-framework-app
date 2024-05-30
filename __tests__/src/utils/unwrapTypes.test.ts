// External dependencies
import type { AttributeValue } from '@aws-sdk/client-dynamodb';

// Internal dependencies
import unwrapTypes from '../../../src/utils/unwrapTypes';

describe('unwrapTypes', () => {
  test('given an raw dynamodb response object, it should return the type annotations', () => {
    const dynamoLikeResponse: Record<string, AttributeValue> = {
      id: { N: '1', },
      fullName: { S: 'John Doe' },
      isActive: { BOOL: true },
    };

    const formattedObject = unwrapTypes(dynamoLikeResponse);

    expect(formattedObject).toStrictEqual({
      id: '1',
      fullName: 'John Doe',
      isActive: true
    });
  });
});