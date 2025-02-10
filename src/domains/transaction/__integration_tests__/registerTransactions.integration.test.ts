import { ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import registerTransaction from "../registerTransaction";
import dynamoDBClient from "../../../database/client";
import { transactionsDatabase } from "../database";

describe("registerTransaction (Integration Test)", () => {
    const userId = "user-123";
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

    it("should register a transaction successfully in DynamoDB", async () => {
        const register = registerTransaction(transactionsDatabase);

        const transaction = await register(userId, amount, description);

        const scanResult = await dynamoDBClient.send(new ScanCommand({ TableName: "Transactions" }));
        const savedTransaction = scanResult.Items?.find((item: any) => item.Id === transaction.id);

        expect(savedTransaction).toBeDefined();
        expect(savedTransaction).toMatchObject({
            Id: transaction.id,
            UserId: userId,
            Amount: amount,
            CreatedAt: transaction.createdAt,
            Description: description,
        });
    });

    it("should throw an error if amount is zero", async () => {
        const register = registerTransaction(transactionsDatabase);

        await expect(register(userId, 0, description)).rejects.toThrow("Amount must not be zero.");
    });

    it("should throw an error if description is empty", async () => {
        const register = registerTransaction(transactionsDatabase);

        await expect(register(userId, amount, "")).rejects.toThrow("Description is required.");
    });
});