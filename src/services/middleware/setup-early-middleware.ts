/**
 * Setup Early Middleware
 * Configures CORS, body parsing, and other early middleware
 */

import cors from 'cors';
import express, { Express } from 'express';

export const setupEarlyMiddleware = (app: Express): void => {
  // CORS middleware
  app.use(cors());

  app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - startedAt;
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
    });
    next();
  });

  // JSON body parsing middleware
  app.use(express.json());
  
  // URL-encoded body parsing middleware
  app.use(express.urlencoded({ extended: true }));
};
