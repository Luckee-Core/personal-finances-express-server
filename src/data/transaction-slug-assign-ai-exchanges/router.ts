import { Router } from 'express';
import { getTransactionSlugAssignAiExchangeByIdHandler } from './routes/get-transaction-slug-assign-ai-exchange-by-id-handler';
import { getTransactionSlugAssignAiExchangesHandler } from './routes/get-transaction-slug-assign-ai-exchanges-handler';

/**
 * Creates the transaction slug assign AI exchanges router for /api/data/transaction-slug-assign-ai-exchanges.
 */
export const createTransactionSlugAssignAiExchangesRouter = (): Router => {
  const router = Router();

  router.get('/', getTransactionSlugAssignAiExchangesHandler);
  router.get('/:id', getTransactionSlugAssignAiExchangeByIdHandler);

  return router;
};
