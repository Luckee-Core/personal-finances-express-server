import { Router } from 'express';
import { getTransactionSlugAssignAiRequestByIdHandler } from './routes/get-transaction-slug-assign-ai-request-by-id-handler';
import { getTransactionSlugAssignAiRequestsHandler } from './routes/get-transaction-slug-assign-ai-requests-handler';

/**
 * Creates the transaction slug assign AI requests router for /api/data/transaction-slug-assign-ai-requests.
 */
export const createTransactionSlugAssignAiRequestsRouter = (): Router => {
  const router = Router();

  router.get('/', getTransactionSlugAssignAiRequestsHandler);
  router.get('/:id', getTransactionSlugAssignAiRequestByIdHandler);

  return router;
};
