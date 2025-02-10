import { TransactionsDatabase } from "../database/types";
import registerTransaction from "../registerTransaction";


const mockDatabase: TransactionsDatabase = {
  saveTransaction: jest.fn(),
  listTransactions: jest.fn(),
  getMonthlyTransactions: jest.fn(),
};

describe("registerTransaction", () => {
  const userId = "user-123";
  const amount = 100;
  const description = "Test transaction";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register a transaction successfully", async () => {
    const register = registerTransaction(mockDatabase);

    const transaction = await register(userId, amount, description);

    expect(mockDatabase.saveTransaction).toHaveBeenCalledTimes(1);
    expect(mockDatabase.saveTransaction).toHaveBeenCalledWith(transaction);

    expect(transaction).toEqual({
      id: expect.any(String),
      userId,
      amount,
      createdAt: expect.any(String),
      description,
    });
  });

  it("should throw an error if amount is zero", async () => {
    const register = registerTransaction(mockDatabase);

    await expect(register(userId, 0, description)).rejects.toThrow("Amount must not be zero.");
    expect(mockDatabase.saveTransaction).not.toHaveBeenCalled();
  });

  it("should throw an error if description is empty", async () => {
    const register = registerTransaction(mockDatabase);

    await expect(register(userId, amount, "")).rejects.toThrow("Description is required.");
    expect(mockDatabase.saveTransaction).not.toHaveBeenCalled();
  });

  it("should throw an error if saving transaction fails", async () => {
    const mockDatabase: TransactionsDatabase = {
        saveTransaction: jest.fn().mockRejectedValueOnce(new Error("Save failed")),
        listTransactions: jest.fn(),
        getMonthlyTransactions: jest.fn(),
      };
    const register = registerTransaction(mockDatabase);

    await expect(register(userId, amount, description)).rejects.toThrow("Could not register transaction.");
    expect(mockDatabase.saveTransaction).toHaveBeenCalledTimes(1);
  });
});