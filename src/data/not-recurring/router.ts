import { Router } from 'express';
import { getNotRecurringHandler } from './routes/get-not-recurring-handler';

/**
 * Creates the not_recurring router for /api/data/not-recurring.
 */
export const createNotRecurringRouter = (): Router => {
  const router = Router();
  router.get('/', getNotRecurringHandler);
  return router;
};
