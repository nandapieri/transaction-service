import calculateBalance from "../calculateBalance";
import { TransactionsDatabase } from "../database/types";
import { Transaction } from "../types";

const mockDatabase: TransactionsDatabase = {
  saveTransaction: jest.fn(),
  listTransactions: jest.fn(),
  getMonthlyTransactions: jest.fn(),
};

describe("calculateBalance", () => {
  it("should calculate the correct balance for a given month", async () => {
    const transactions: Transaction[] = [
      { id: "1", userId: "user-123", amount: 100, createdAt: "2025-01-01T00:00:00Z", description: "Test 1" },
      { id: "2", userId: "user-123", amount: -50, createdAt: "2025-01-02T00:00:00Z", description: "Test 2" },
      { id: "3", userId: "user-123", amount: 200, createdAt: "2025-01-03T00:00:00Z", description: "Test 3" },
    ];

    (mockDatabase.getMonthlyTransactions as jest.Mock).mockResolvedValue(transactions);

    const getBalance = calculateBalance(mockDatabase);
    const balance = await getBalance("user-123", "2025-01");

    expect(balance).toBe(250);
    expect(mockDatabase.getMonthlyTransactions).toHaveBeenCalledWith("user-123", "2025-01");
  });

  it("should return zero if no transactions are found", async () => {
    (mockDatabase.getMonthlyTransactions as jest.Mock).mockResolvedValue([]);

    const getBalance = calculateBalance(mockDatabase);
    const balance = await getBalance("user-123", "2025-01");

    expect(balance).toBe(0);
    expect(mockDatabase.getMonthlyTransactions).toHaveBeenCalledWith("user-123", "2025-01");
  });

  it("should handle errors", async () => {
    (mockDatabase.getMonthlyTransactions as jest.Mock).mockRejectedValue(new Error("Failed to retrieve transactions"));

    const getBalance = calculateBalance(mockDatabase);

    await expect(getBalance("user-123", "2025-01")).rejects.toThrow("Could not calculate balance.");
    expect(mockDatabase.getMonthlyTransactions).toHaveBeenCalledWith("user-123", "2025-01");
  });
});