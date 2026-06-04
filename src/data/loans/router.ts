import { Router } from 'express';
import { deleteLoanHandler } from './routes/delete-loan-handler';
import { getLoansHandler } from './routes/get-loans-handler';
import { patchLoanHandler } from './routes/patch-loan-handler';
import { postLoanHandler } from './routes/post-loan-handler';

/**
 * CRUD router for loans.
 */
export const createLoansRouter = (): Router => {
  const router = Router();

  router.get('/', getLoansHandler);
  router.post('/', postLoanHandler);
  router.patch('/:id', patchLoanHandler);
  router.delete('/:id', deleteLoanHandler);

  return router;
};
