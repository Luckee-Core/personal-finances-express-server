import { Router } from 'express';
import { getTransactionCategoryAssignAiResponseByIdHandler } from './routes/get-transaction-category-assign-ai-response-by-id-handler';
import { getTransactionCategoryAssignAiResponsesHandler } from './routes/get-transaction-category-assign-ai-responses-handler';

/**
 * Creates the transaction category assign AI responses router.
 */
export const createTransactionCategoryAssignAiResponsesRouter = (): Router => {
  const router = Router();
  router.get('/', getTransactionCategoryAssignAiResponsesHandler);
  router.get('/:id', getTransactionCategoryAssignAiResponseByIdHandler);
  return router;
};
