import { Router } from 'express';
import { deleteCategoryHandler } from './routes/delete-category-handler';
import { getCategoriesHandler } from './routes/get-categories-handler';
import { patchCategoryHandler } from './routes/patch-category-handler';
import { postCategoryHandler } from './routes/post-category-handler';

/**
 * Creates the categories router for /api/data/categories.
 */
export const createCategoriesRouter = (): Router => {
  const router = Router();

  router.get('/', getCategoriesHandler);
  router.post('/', postCategoryHandler);
  router.patch('/:id', patchCategoryHandler);
  router.delete('/:id', deleteCategoryHandler);

  return router;
};
