import { Router } from 'express';
import { postAssignTransactionSlugHandler } from './routes/post-assign-transaction-slug-handler';
import { postAssignTransactionSlugsBatchHandler } from './routes/post-assign-transaction-slugs-batch-handler';

/**
 * Creates AI routes for transaction slug assignment at /api/ai.
 */
export const createTransactionSlugAssignRouter = (): Router => {
  const router = Router();

  router.post('/transactions/assign-slugs', postAssignTransactionSlugsBatchHandler);
  router.post('/transactions/:id/assign-slug', postAssignTransactionSlugHandler);

  return router;
};
