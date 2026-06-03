/**
 * Setup Error Handling Middleware
 * Handles errors and sends appropriate responses
 */

import { Express, Request, Response, NextFunction } from 'express';

export const setupErrorHandling = (app: Express): void => {
  // 404 handler - must be after all routes
  app.use((req: Request, res: Response) => {
    console.error(`❌ ${req.method} ${req.path} not found`);
    res.status(400).json({
      success: false,
      error: `Cannot ${req.method} ${req.path}`,
    });
  });

  // Global error handler
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    console.error('❌ Unhandled error:', err);

    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error',
    });
  });
};
