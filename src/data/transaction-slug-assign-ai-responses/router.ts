import { Router } from 'express';
import { getTransactionSlugAssignAiResponseByIdHandler } from './routes/get-transaction-slug-assign-ai-response-by-id-handler';
import { getTransactionSlugAssignAiResponsesHandler } from './routes/get-transaction-slug-assign-ai-responses-handler';

/**
 * Creates the transaction slug assign AI responses router for /api/data/transaction-slug-assign-ai-responses.
 */
export const createTransactionSlugAssignAiResponsesRouter = (): Router => {
  const router = Router();

  router.get('/', getTransactionSlugAssignAiResponsesHandler);
  router.get('/:id', getTransactionSlugAssignAiResponseByIdHandler);

  return router;
};
