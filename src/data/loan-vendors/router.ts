import { Router } from 'express';
import { deleteLoanVendorHandler } from './routes/delete-loan-vendor-handler';
import { getLoanVendorsHandler } from './routes/get-loan-vendors-handler';
import { patchLoanVendorHandler } from './routes/patch-loan-vendor-handler';
import { postLoanVendorHandler } from './routes/post-loan-vendor-handler';

/**
 * CRUD router for loan vendors.
 */
export const createLoanVendorsRouter = (): Router => {
  const router = Router();

  router.get('/', getLoanVendorsHandler);
  router.post('/', postLoanVendorHandler);
  router.patch('/:id', patchLoanVendorHandler);
  router.delete('/:id', deleteLoanVendorHandler);

  return router;
};
