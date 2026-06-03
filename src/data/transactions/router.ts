import { Router } from 'express';
import { deleteTransactionHandler } from './routes/delete-transaction-handler';
import { getTransactionByIdHandler } from './routes/get-transaction-by-id-handler';
import { getTransactionsHandler } from './routes/get-transactions-handler';
import { patchTransactionHandler } from './routes/patch-transaction-handler';
import { postTransactionHandler } from './routes/post-transaction-handler';

/**
 * Creates the transactions router for /api/data/transactions.
 */
export const createTransactionsRouter = (): Router => {
  const router = Router();

  router.get('/', getTransactionsHandler);
  router.get('/:id', getTransactionByIdHandler);
  router.post('/', postTransactionHandler);
  router.patch('/:id', patchTransactionHandler);
  router.delete('/:id', deleteTransactionHandler);

  return router;
};
