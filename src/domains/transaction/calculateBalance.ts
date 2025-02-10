import { TransactionsDatabase } from "./database/types";


const calculateBalance = (Database: TransactionsDatabase) => {
  return async (userId: string, yearMonth: string): Promise<number> => {
    try {
      const transactions = await Database.getMonthlyTransactions(userId, yearMonth);

      const balance = transactions.reduce((total, transaction) => total + transaction.amount, 0);

      return balance;
    } catch (error) {
      throw new Error("Could not calculate balance.");
    }
  };
};

export default calculateBalance;