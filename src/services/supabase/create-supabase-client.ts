import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Request, Response, NextFunction } from 'express';

let managedClient: SupabaseClient | null = null;

/**
 * Get or create the managed Supabase client (same pattern as roads-platform / lead-studio).
 */
export const getManagedSupabaseClient = (): SupabaseClient | null => {
  if (managedClient) return managedClient;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('❌ Managed Supabase not configured');
    return null;
  }

  managedClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return managedClient;
};

/**
 * Create managed Supabase client or throw.
 */
export const createManagedSupabaseClient = (): SupabaseClient => {
  const client = getManagedSupabaseClient();
  if (!client) {
    throw new Error('Managed Supabase not configured');
  }
  return client;
};

/**
 * Initializes the managed Supabase client at server startup.
 */
export const initializeManagedSupabaseClient = (): void => {
  console.log('🚀 Initializing managed Supabase client');
  const client = getManagedSupabaseClient();
  if (client) {
    console.log('✅ Managed Supabase client ready');
  } else {
    console.error('❌ Managed Supabase client not configured');
  }
};

/**
 * Attach Supabase client to each request.
 */
export const attachSupabaseClient = (req: Request, res: Response, next: NextFunction): void => {
  try {
    req.supabase = createManagedSupabaseClient();
    next();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: message || 'Failed to initialize database connection',
    });
  }
};
