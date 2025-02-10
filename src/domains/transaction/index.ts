import { transactionsDatabase } from "./database";

import _registerTransaction from "./registerTransaction";

export const registerTransaction = _registerTransaction(transactionsDatabase);