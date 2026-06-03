import { Router } from 'express';
import { deleteRecurringPurchaseHandler } from './routes/delete-recurring-purchase-handler';
import { getRecurringPurchasesHandler } from './routes/get-recurring-purchases-handler';
import { patchRecurringPurchaseHandler } from './routes/patch-recurring-purchase-handler';
import { postMarkNotRecurringHandler } from './routes/post-mark-not-recurring-handler';
import { postRecurringPurchaseHandler } from './routes/post-recurring-purchase-handler';

/**
 * Creates the recurring purchases router for /api/data/recurring-purchases.
 */
export const createRecurringPurchasesRouter = (): Router => {
  const router = Router();

  router.get('/', getRecurringPurchasesHandler);
  router.post('/', postRecurringPurchaseHandler);
  router.post('/:id/mark-not-recurring', postMarkNotRecurringHandler);
  router.patch('/:id', patchRecurringPurchaseHandler);
  router.delete('/:id', deleteRecurringPurchaseHandler);

  return router;
};
