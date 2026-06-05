import { Router } from 'express';
import { statementImportUpload } from '../../services/statement-import/statement-import-upload';
import { getStatementImportByIdHandler } from './routes/get-statement-import-by-id-handler';
import { getStatementImportsHandler } from './routes/get-statement-imports-handler';
import { postStatementImportHandler } from './routes/post-statement-import-handler';

/**
 * Creates the statement imports router for /api/data/statement-imports.
 */
export const createStatementImportsRouter = (): Router => {
  const router = Router();

  router.get('/', getStatementImportsHandler);
  router.get('/:id', getStatementImportByIdHandler);
  router.post('/', statementImportUpload.single('file'), postStatementImportHandler);

  return router;
};
