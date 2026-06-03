import { Router } from 'express';
import { getLlmModelsHandler } from './routes/get-llm-models-handler';

/**
 * Read-only LLM model pricing at /api/data/llm-models.
 */
export const createLlmModelsRouter = (): Router => {
  const router = Router();
  router.get('/', getLlmModelsHandler);
  return router;
};
