import { Transaction } from "../types";

export type TransactionDB = {
    Id: string;
    UserId: string;
    Amount: number;
    CreatedAt: string;
    Description: string;
  };

export type QueryResult<T> = {
  items: T[];
  lastEvaluatedKey?: any;
};
  
export type TransactionQueryResult = QueryResult<Transaction>;

export type TransactionsDatabase = {
  saveTransaction: (transaction: any) => Promise<void>;
  listTransactions: (userId: string, limit: number, lastEvaluatedKey?: any) => Promise<TransactionQueryResult>;
  calculateMonthlyBalance: (userId: string, yearMonth: string) => Promise<number>;
};