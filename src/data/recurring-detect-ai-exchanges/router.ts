import { Router } from 'express';
import { getRecurringDetectAiExchangeByIdHandler } from './routes/get-recurring-detect-ai-exchange-by-id-handler';
import { getRecurringDetectAiExchangesHandler } from './routes/get-recurring-detect-ai-exchanges-handler';

/**
 * Creates the transaction recurring detect AI exchanges router.
 */
export const createRecurringDetectAiExchangesRouter = (): Router => {
  const router = Router();
  router.get('/', getRecurringDetectAiExchangesHandler);
  router.get('/:id', getRecurringDetectAiExchangeByIdHandler);
  return router;
};
