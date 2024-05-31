// External dependencies
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

// External dependencies
import dynamodb from '../../../src/lib/dynamodb';

describe('dynamodb client', () => {
  test('it should be an instance of DynamoDBClient', () => { 
    expect(dynamodb instanceof DynamoDBClient).toBeTruthy();
  });
});
