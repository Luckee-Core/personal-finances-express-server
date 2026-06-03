import { Router } from 'express';
import { getRecurringDetectAiResponseByIdHandler } from './routes/get-recurring-detect-ai-response-by-id-handler';
import { getRecurringDetectAiResponsesHandler } from './routes/get-recurring-detect-ai-responses-handler';

/**
 * Creates the transaction recurring detect AI responses router.
 */
export const createRecurringDetectAiResponsesRouter = (): Router => {
  const router = Router();
  router.get('/', getRecurringDetectAiResponsesHandler);
  router.get('/:id', getRecurringDetectAiResponseByIdHandler);
  return router;
};
