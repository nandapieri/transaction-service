import { v4 as uuidv4 } from "uuid";
import { TransactionsDatabase } from "./database/types";
import { Transaction } from "./types";

const registerTransaction = (Database: TransactionsDatabase) => {
  return async (userId: string, amount: number, description: string): Promise<Transaction> => {
    if (amount === 0) {
      throw new Error("Amount must not be zero.");
    }
    if (!description) {
      throw new Error("Description is required.");
    }

    const transaction = {
      id: uuidv4(),
      userId,
      amount,
      createdAt: new Date().toISOString(),
      description,
    };

    try {
      await Database.saveTransaction(transaction);
      return transaction;
    } catch (error) {
      throw new Error("Could not register transaction.");
    }
  }
};

export default registerTransaction;