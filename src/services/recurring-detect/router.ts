import { Router } from 'express';
import { postDetectRecurringBatchHandler } from './routes/post-detect-recurring-batch-handler';

/**
 * Creates AI routes for recurring detection at /api/ai.
 */
export const createRecurringDetectRouter = (): Router => {
  const router = Router();
  router.post('/recurring/detect', postDetectRecurringBatchHandler);
  return router;
};
