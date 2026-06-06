import type { Request, Response } from 'express';
import { sendHandlerError, sendSuccess } from '../../../utils/http/responses';
import { buildApiDocsCatalog } from '../api-docs-catalog';

/**
 * Handles GET /api-docs.json — returns the API documentation catalog.
 */
export const getApiDocsJsonHandler = async (_req: Request, res: Response): Promise<void> => {
  console.log('📥 GET /api-docs.json');

  try {
    const catalog = buildApiDocsCatalog();
    sendSuccess(res, catalog);
    console.log('📤 GET /api-docs.json 200');
  } catch (error) {
    sendHandlerError(res, error, 'GET /api-docs.json');
  }
};
