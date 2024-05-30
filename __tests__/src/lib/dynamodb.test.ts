// External dependencies
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { describe, expect, test } from 'vitest';

// External dependencies
import dynamodb from '../../../src/lib/dynamodb';

describe('dynamodb client', () => {
  test('it should be an instance of DynamoDBClient', () => { 
    expect(dynamodb instanceof DynamoDBClient).toBeTruthy();
  });
});
