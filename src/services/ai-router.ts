import { Router } from 'express';
import { createRecurringDetectRouter } from './recurring-detect';
import { createTransactionCategoryAssignRouter } from './transaction-category-assign';
import { createTransactionSlugAssignRouter } from '../domains/transaction-slug-assign';

/**
 * Combined /api/ai router for all AI-powered features.
 */
export const createAiRouter = (): Router => {
  const router = Router();
  router.use(createTransactionSlugAssignRouter());
  router.use(createTransactionCategoryAssignRouter());
  router.use(createRecurringDetectRouter());
  return router;
};
