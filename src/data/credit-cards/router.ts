import { Router } from 'express';
import { deleteCreditCardHandler } from './routes/delete-credit-card-handler';
import { getCreditCardsHandler } from './routes/get-credit-cards-handler';
import { patchCreditCardHandler } from './routes/patch-credit-card-handler';
import { postCreditCardHandler } from './routes/post-credit-card-handler';

export const createCreditCardsRouter = (): Router => {
  const router = Router();

  router.get('/', getCreditCardsHandler);
  router.post('/', postCreditCardHandler);
  router.patch('/:id', patchCreditCardHandler);
  router.delete('/:id', deleteCreditCardHandler);

  return router;
};
