import { Router } from 'express';
import { deleteAnticipatedCostHandler } from './routes/delete-anticipated-cost-handler';
import { getAnticipatedCostsHandler } from './routes/get-anticipated-costs-handler';
import { patchAnticipatedCostHandler } from './routes/patch-anticipated-cost-handler';
import { postAnticipatedCostHandler } from './routes/post-anticipated-cost-handler';

/**
 * CRUD router for planned future expenses.
 */
export const createAnticipatedCostsRouter = (): Router => {
  const router = Router();

  router.get('/', getAnticipatedCostsHandler);
  router.post('/', postAnticipatedCostHandler);
  router.patch('/:id', patchAnticipatedCostHandler);
  router.delete('/:id', deleteAnticipatedCostHandler);

  return router;
};
