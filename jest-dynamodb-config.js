module.exports = {
    tables: [
      {
        TableName: "Transactions",
        KeySchema: [
          { AttributeName: "Id", KeyType: "HASH" },
        ],
        AttributeDefinitions: [
          { AttributeName: "Id", AttributeType: "S" },
          { AttributeName: "UserId", AttributeType: "S" },
          { AttributeName: "CreatedAt", AttributeType: "S" },
        ],
        BillingMode: "PAY_PER_REQUEST",
        GlobalSecondaryIndexes: [
          {
            IndexName: "UserIdIndex",
            KeySchema: [
              { AttributeName: "UserId", KeyType: "HASH" },
              { AttributeName: "CreatedAt", KeyType: "RANGE" },
            ],
            Projection: { ProjectionType: "ALL" },
          },
        ],
      },
    ],
  };