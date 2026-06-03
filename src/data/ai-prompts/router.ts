import { Router } from 'express';
import { deleteAiPromptHandler } from './routes/delete-ai-prompt-handler';
import { getAiPromptByIdHandler } from './routes/get-ai-prompt-by-id-handler';
import { getAiPromptsHandler } from './routes/get-ai-prompts-handler';
import { patchAiPromptHandler } from './routes/patch-ai-prompt-handler';
import { postActivateAiPromptHandler } from './routes/post-activate-ai-prompt-handler';
import { postAiPromptHandler } from './routes/post-ai-prompt-handler';

/**
 * Creates the AI prompts router for /api/data/ai-prompts.
 */
export const createAiPromptsRouter = (): Router => {
  const router = Router();

  router.get('/', getAiPromptsHandler);
  router.get('/:id', getAiPromptByIdHandler);
  router.post('/', postAiPromptHandler);
  router.post('/:id/activate', postActivateAiPromptHandler);
  router.patch('/:id', patchAiPromptHandler);
  router.delete('/:id', deleteAiPromptHandler);

  return router;
};
