/**
 * Initializes managed clients and starts the Express server.
 */

import { Express } from 'express';
import { initializeAnthropicClient } from '../ai';
import { initializeManagedSupabaseClient } from '../supabase';

type ServerConfig = {
  port: number;
  environment: string;
};

export const startServer = (app: Express, config: ServerConfig): void => {
  const { port, environment } = config;

  console.log('🚀 Starting personal-finances express server');
  initializeManagedSupabaseClient();
  initializeAnthropicClient();

  app.listen(port, () => {
    console.log('');
    console.log('='.repeat(50));
    console.log('🚀 Personal Finances Express Server');
    console.log('='.repeat(50));
    console.log(`Environment: ${environment}`);
    console.log(`Port: ${port}`);
    console.log(`URL: http://localhost:${port}`);
    console.log(`Health Check: http://localhost:${port}/api/health`);
    console.log('='.repeat(50));
    console.log('');
  });
};
