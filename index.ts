import express from 'express';
import dotenv from 'dotenv';
import path from 'path';

const DEFAULT_PORT = 3011;

dotenv.config({ path: path.resolve(__dirname, '.env'), override: true });
dotenv.config({ path: path.resolve(__dirname, '.env.local'), override: true });

const app = express();
const portFromEnv = Number(process.env.PORT);
const PORT =
  Number.isFinite(portFromEnv) && portFromEnv > 0 ? portFromEnv : DEFAULT_PORT;

import { setupEarlyMiddleware } from './src/services/middleware';
setupEarlyMiddleware(app);

import { attachSupabaseClient } from './src/services/supabase/create-supabase-client';
app.use(attachSupabaseClient);

import { createHealthRouter } from './src/services/health';
app.use('/', createHealthRouter());
app.use('/api/health', createHealthRouter());

import { createPersonalFinancesDataService } from './src/data/personal-finances-data-service';
app.use('/api/data', createPersonalFinancesDataService());

import { createAiRouter } from './src/services/ai-router';
app.use('/api/ai', createAiRouter());

import { createApiDocsRouter } from './src/services/api-docs';
app.use(createApiDocsRouter());

import { setupErrorHandling } from './src/services/middleware';
setupErrorHandling(app);

import { startServer } from './src/services/server';
startServer(app, {
  port: PORT,
  environment: process.env.NODE_ENV || 'development',
});

export default app;
