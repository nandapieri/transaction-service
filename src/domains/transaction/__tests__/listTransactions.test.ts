import { TransactionsDatabase } from "../database/types";
import listTransactions from "../listTransactions";
import { Transaction } from "../types";

const mockDatabase: TransactionsDatabase = {
  saveTransaction: jest.fn(),
  listTransactions: jest.fn(),
  getMonthlyTransactions: jest.fn(),
};

describe("listTransactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should iterate over transactions pages", async () => {

    const transactionsPage1: Transaction[] = [
      { id: "1", userId: "user-123", amount: 100, createdAt: "2025-01-01T00:00:00Z", description: "Test 1" },
      { id: "2", userId: "user-123", amount: 200, createdAt: "2025-01-02T00:00:00Z", description: "Test 2" },
    ];
    const transactionsPage2: Transaction[] = [
      { id: "3", userId: "user-123", amount: 300, createdAt: "2025-01-03T00:00:00Z", description: "Test 3" },
    ];

    // Configuração do mock para retornar duas páginas
    (mockDatabase.listTransactions as jest.Mock)
      .mockResolvedValueOnce({ items: transactionsPage1, lastEvaluatedKey: "page1" })
      .mockResolvedValueOnce({ items: transactionsPage2, lastEvaluatedKey: undefined });

    const userId = "user-123";
    const limit = 2;
    const getTransactions = listTransactions(mockDatabase);

    const results: Transaction[] = [];
    for await (const page of getTransactions(userId, limit)) {
      results.push(...page);
    }

    expect(results).toEqual([...transactionsPage1, ...transactionsPage2]);
    expect(mockDatabase.listTransactions).toHaveBeenCalledTimes(2);
    expect(mockDatabase.listTransactions).toHaveBeenCalledWith(userId, limit, undefined);
    expect(mockDatabase.listTransactions).toHaveBeenCalledWith(userId, limit, "page1");
  });

  it("should handle errors", async () => {
    (mockDatabase.listTransactions as jest.Mock).mockRejectedValue(new Error("Failed to list transactions"));

    const userId = "user-456";
    const limit = 2;
    const getTransactions = listTransactions(mockDatabase);

    try {
      for await (const page of getTransactions(userId, limit)) {
        fail("Expected error to be thrown");
      }
    } catch (error) {
      expect(error).toEqual(new Error("Could not list transactions."));
    }

    expect(mockDatabase.listTransactions).toHaveBeenCalledTimes(1);
  });
});