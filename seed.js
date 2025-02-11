import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: 'http://localhost:4566', // ou use http://host.docker.internal:4566 se necessário
});

const dynamoDBClient = DynamoDBDocumentClient.from(client);

async function populateData() {
  const dataItems = [
    {
      Id: '1',
      UserId: 'user-123',
      Amount: 100,
      CreatedAt: '2025-02-01T00:00:00Z',
      Description: 'Initial transaction 1'
    },
    {
      Id: '2',
      UserId: 'user-123',
      Amount: -50,
      CreatedAt: '2025-02-02T00:00:00Z',
      Description: 'Initial transaction 2'
    },
    {
      Id: '3',
      UserId: 'user-456',
      Amount: 200,
      CreatedAt: '2025-02-03T00:00:00Z',
      Description: 'Initial transaction 3'
    }
  ];

  try {
    for (const item of dataItems) {
      const command = new PutCommand({
        TableName: 'Transactions',
        Item: item,
      });
      await dynamoDBClient.send(command);
      console.log(`Inserted item with Id: ${item.Id}`);
    }
    console.log('Data population completed.');
  } catch (error) {
    console.error('Error populating data:', error);
  }
}

populateData();