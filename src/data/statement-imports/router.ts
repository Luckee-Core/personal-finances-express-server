import { Router } from 'express';
import multer from 'multer';
import { getStatementImportByIdHandler } from './routes/get-statement-import-by-id-handler';
import { getStatementImportsHandler } from './routes/get-statement-imports-handler';
import { postStatementImportHandler } from './routes/post-statement-import-handler';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isCsv =
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.toLowerCase().endsWith('.csv');
    if (!isCsv) {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  },
});

/**
 * Creates the statement imports router for /api/data/statement-imports.
 */
export const createStatementImportsRouter = (): Router => {
  const router = Router();

  router.get('/', getStatementImportsHandler);
  router.get('/:id', getStatementImportByIdHandler);
  router.post('/', upload.single('file'), postStatementImportHandler);

  return router;
};
