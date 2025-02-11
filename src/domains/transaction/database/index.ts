import dynamoDBClient from "../../../database/client";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { TransactionDB, TransactionQueryResult, TransactionsDatabase } from "./types";
import { Transaction } from "../types";

const TABLE_NAME = "Transactions";

const parseTransactionDB = (item: TransactionDB): Transaction => {
  return {
    id: item.Id,
    userId: item.UserId,
    amount: item.Amount,
    createdAt: item.CreatedAt,
    description: item.Description,
  };
};

export const saveTransaction = async (transaction: Transaction) => {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      Id: transaction.id,
      UserId: transaction.userId,
      Amount: transaction.amount,
      CreatedAt: transaction.createdAt,
      Description: transaction.description,
    },
  };

  try {
    await dynamoDBClient.send(new PutCommand(params));
  } catch (error) {
    throw new Error("Could not save transaction");
  }
};

export const listTransactions = async (
  userId: string,
  limit: number,
  lastEvaluatedKey: any = undefined
): Promise<TransactionQueryResult> => {
  const params: any = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "#userId = :userId",
    ExpressionAttributeNames: { "#userId": "UserId" },
    ExpressionAttributeValues: {
      ":userId": userId,
    },
    IndexName: "UserIdIndex",
    Limit: limit,
    ExclusiveStartKey: lastEvaluatedKey,
  };

  try {
    const result = await dynamoDBClient.send(new QueryCommand(params));
    const items = (result.Items ?? []).map((item: any) => parseTransactionDB(item as TransactionDB));
    return {
      items,
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  } catch (error) {
    console.error("Erro real no DynamoDB:", error);
    throw new Error("Could not list transactions: ");
  }
};

export const getMonthlyTransactions = async (
  userId: string,
  yearMonth: string
): Promise<Transaction[]> => {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "UserId = :userId AND begins_with(CreatedAt, :yearMonth)",
    ExpressionAttributeValues: {
      ":userId": userId,
      ":yearMonth": yearMonth,
    },
    IndexName: "UserIdIndex",
  };

  try {
    const result = await dynamoDBClient.send(new QueryCommand(params));
    return (result.Items ?? []).map((item: any) => parseTransactionDB(item as TransactionDB));
  } catch (error) {
    throw new Error("Could not retrieve monthly transactions");
  }
};

export const transactionsDatabase: TransactionsDatabase = {
  saveTransaction: async (transaction: Transaction): Promise<void> => {
    return saveTransaction(transaction);
  },
  listTransactions: async (userId: string, limit: number, lastEvaluatedKey?: any): Promise<TransactionQueryResult> => {
    return listTransactions(userId, limit, lastEvaluatedKey);
  },
  getMonthlyTransactions: async (userId: string, yearMonth: string): Promise<Transaction[]> => {
    return getMonthlyTransactions(userId, yearMonth);
  },
};