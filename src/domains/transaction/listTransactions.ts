import { TransactionsDatabase } from "./database/types";
import { Transaction } from "./types";

const listTransactions = (Database: TransactionsDatabase) => {
  return async function* (userId: string, limit: number): AsyncGenerator<Transaction[]> {
    let lastEvaluatedKey = undefined;

    do {
      try {
        const result = await Database.listTransactions(userId, limit, lastEvaluatedKey);
        yield result.items;
        lastEvaluatedKey = result.lastEvaluatedKey;
      } catch (error) {
        throw new Error("Could not list transactions.");
      }
    } while (lastEvaluatedKey);
  };
};

export default listTransactions;