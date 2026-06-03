import { Router } from 'express';
import { deleteBankAccountHandler } from './routes/delete-bank-account-handler';
import { getBankAccountsHandler } from './routes/get-bank-accounts-handler';
import { patchBankAccountHandler } from './routes/patch-bank-account-handler';
import { postBankAccountHandler } from './routes/post-bank-account-handler';

/**
 * Creates the bank accounts router for /api/data/bank-accounts.
 */
export const createBankAccountsRouter = (): Router => {
  const router = Router();

  router.get('/', getBankAccountsHandler);
  router.post('/', postBankAccountHandler);
  router.patch('/:id', patchBankAccountHandler);
  router.delete('/:id', deleteBankAccountHandler);

  return router;
};
