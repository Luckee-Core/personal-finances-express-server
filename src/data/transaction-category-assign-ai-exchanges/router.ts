import { Router } from 'express';
import { getTransactionCategoryAssignAiExchangeByIdHandler } from './routes/get-transaction-category-assign-ai-exchange-by-id-handler';
import { getTransactionCategoryAssignAiExchangesHandler } from './routes/get-transaction-category-assign-ai-exchanges-handler';

/**
 * Creates the transaction category assign AI exchanges router.
 */
export const createTransactionCategoryAssignAiExchangesRouter = (): Router => {
  const router = Router();
  router.get('/', getTransactionCategoryAssignAiExchangesHandler);
  router.get('/:id', getTransactionCategoryAssignAiExchangeByIdHandler);
  return router;
};
