import { transactionsDatabase } from "./database";

import _registerTransaction from "./registerTransaction";
import _listTransactions from "./listTransactions";

export const registerTransaction = _registerTransaction(transactionsDatabase);
export const listTransactions = _listTransactions(transactionsDatabase);