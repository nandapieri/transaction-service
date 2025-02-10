import { ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDBClient from "../../../database/client";
import { transactionsDatabase } from "../database";
import registerTransaction from "../registerTransaction";
import calculateBalance from "../calculateBalance";

describe("calculateBalance (Integration Test)", () => {
  const userId = "user-123";
  const otherUserId = "user-456";
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

  it("should calculate the correct balance for a given month", async () => {
    const register = registerTransaction(transactionsDatabase);

    await register(userId, 100, description);
    await register(userId, -50, description);
    await register(userId, 200, description);

    const getBalance = calculateBalance(transactionsDatabase);
    const balance = await getBalance(userId, "2025-02");

    expect(balance).toBe(250); // 100 - 50 + 200
  });

  it("should return zero if no transactions are found", async () => {
    const getBalance = calculateBalance(transactionsDatabase);
    const balance = await getBalance("non-existent-user", "2025-02");

    expect(balance).toBe(0);
  });

  it("should handle errors", async () => {
    jest.spyOn(transactionsDatabase, 'getMonthlyTransactions').mockRejectedValue(new Error("Simulated error"));

    const getBalance = calculateBalance(transactionsDatabase);

    await expect(getBalance(userId, "2025-02")).rejects.toThrow("Could not calculate balance.");
  });
});