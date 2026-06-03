import { Router } from 'express';
import { getRecurringDetectAiRequestByIdHandler } from './routes/get-recurring-detect-ai-request-by-id-handler';
import { getRecurringDetectAiRequestsHandler } from './routes/get-recurring-detect-ai-requests-handler';

/**
 * Creates the transaction recurring detect AI requests router.
 */
export const createRecurringDetectAiRequestsRouter = (): Router => {
  const router = Router();
  router.get('/', getRecurringDetectAiRequestsHandler);
  router.get('/:id', getRecurringDetectAiRequestByIdHandler);
  return router;
};
