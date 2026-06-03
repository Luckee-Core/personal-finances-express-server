import { Router } from 'express';
import { postAssignTransactionCategoriesBatchHandler } from './routes/post-assign-transaction-categories-batch-handler';
import { postAssignTransactionCategoryHandler } from './routes/post-assign-transaction-category-handler';

/**
 * Creates AI routes for transaction category assignment at /api/ai.
 */
export const createTransactionCategoryAssignRouter = (): Router => {
  const router = Router();
  router.post('/transactions/assign-categories', postAssignTransactionCategoriesBatchHandler);
  router.post('/transactions/:id/assign-category', postAssignTransactionCategoryHandler);
  return router;
};
