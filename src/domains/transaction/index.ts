import { transactionsDatabase } from "./database";

import _registerTransaction from "./registerTransaction";
import _listTransactions from "./listTransactions";
import _calculateBalance from "./calculateBalance";

export const registerTransaction = _registerTransaction(transactionsDatabase);
export const listTransactions = _listTransactions(transactionsDatabase);
export const calculateBalance = _calculateBalance(transactionsDatabase);