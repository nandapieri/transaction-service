import { ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDBClient from "../../../database/client";
import { transactionsDatabase } from "../database";
import registerTransaction from "../registerTransaction";
import listTransactions from "../listTransactions";

describe("listTransactions (Integration Test)", () => {
  const userId = "user-123";
  const otherUserId = "user-456";
  const amount = 100;
  const description = "Test transaction";

  beforeEach(async () => {
    const scanResult = await dynamoDBClient.send(new ScanCommand({ TableName: "Transactions" }));
    for (const item of scanResult.Items || []) {
      await dynamoDBClient.send(
        new DeleteCommand({
          TableName: "Transactions",
          Key: { Id: item.Id },
        })
      );
    }
  });

  it("should list transactions for a specific user", async () => {
    const register = registerTransaction(transactionsDatabase);

    await register(userId, amount, description);
    await register(userId, amount + 50, "Another transaction");
    await register(otherUserId, amount, "Other user transaction");

    const list = listTransactions(transactionsDatabase);
    const transactions = [];
    for await (const batch of list(userId, 10)) {
      transactions.push(...batch);
    }

    expect(transactions).toHaveLength(2);
    transactions.forEach(transaction => {
      expect(transaction.userId).toBe(userId);
      expect(transaction).toHaveProperty("id");
      expect(transaction).toHaveProperty("amount");
      expect(transaction).toHaveProperty("createdAt");
      expect(transaction).toHaveProperty("description");
    });
  });

  it("should return an empty list if no transactions exist for the user", async () => {
    const list = listTransactions(transactionsDatabase);
    const transactions = [];
    for await (const batch of list("non-existent-user", 10)) {
      transactions.push(...batch);
    }

    expect(transactions).toHaveLength(0);
  });
});