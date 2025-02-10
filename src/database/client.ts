import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: 'http://localhost:4566', // Usando LocalStack
});

const dynamoDBClient = DynamoDBDocumentClient.from(client);

export default dynamoDBClient;