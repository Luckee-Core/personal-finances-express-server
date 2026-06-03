import { Router } from 'express';
import { getTransactionCategoryAssignAiRequestByIdHandler } from './routes/get-transaction-category-assign-ai-request-by-id-handler';
import { getTransactionCategoryAssignAiRequestsHandler } from './routes/get-transaction-category-assign-ai-requests-handler';

/**
 * Creates the transaction category assign AI requests router.
 */
export const createTransactionCategoryAssignAiRequestsRouter = (): Router => {
  const router = Router();
  router.get('/', getTransactionCategoryAssignAiRequestsHandler);
  router.get('/:id', getTransactionCategoryAssignAiRequestByIdHandler);
  return router;
};
