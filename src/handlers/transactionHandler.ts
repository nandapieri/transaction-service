import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import * as TransactionDomain from "../domains/transaction";
   
const handlePostTransaction = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing request body" }),
    };
  }
  const { userId, amount, description } = JSON.parse(event.body);
  if (!userId || !amount || !description) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing parameters" }),
    };
  }
  const transaction = await TransactionDomain.registerTransaction(userId, amount, description);
  return {
    statusCode: 201,
    body: JSON.stringify(transaction),
  };
};

const handleGetTransactions = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { userId, limit } = event.queryStringParameters || {};
  if (!userId || !limit) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing query parameters" }),
    };
  }
  const transactions = [];
  for await (const batch of TransactionDomain.listTransactions(userId, parseInt(limit, 10))) {
    transactions.push(...batch);
  }
  return {
    statusCode: 200,
    body: JSON.stringify(transactions),
  };
};

const handleGetBalance = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { userId, month } = event.queryStringParameters || {};
  if (!userId || !month) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing query parameters" }),
    };
  }
  const balance = await TransactionDomain.calculateBalance(userId, month);
  return {
    statusCode: 200,
    body: JSON.stringify({ balance }),
  };
};

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path } = event;

  const routeHandlers: { [key: string]: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult> } = {
    "POST /transactions": handlePostTransaction,
    "GET /transactions": handleGetTransactions,
    "GET /balance": handleGetBalance,
  };

  const routeKey = `${httpMethod} ${path}`;
  const handlerFunction = routeHandlers[routeKey];

  if (handlerFunction) {
    try {
      return await handlerFunction(event);
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: (error as Error).message }),
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ message: "Method Not Allowed" }),
  };
};
