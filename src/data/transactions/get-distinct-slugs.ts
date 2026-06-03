import type { SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_LIMIT = 500;

/**
 * Returns distinct non-null transaction slugs for the assign-slug prompt context.
 */
export const getDistinctTransactionSlugs = async (
  supabase: SupabaseClient,
  options?: { limit?: number },
): Promise<string[]> => {
  const limit = options?.limit ?? DEFAULT_LIMIT;

  const { data, error } = await supabase
    .from('transactions')
    .select('slug')
    .not('slug', 'is', null)
    .order('slug', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load distinct slugs: ${error.message}`);
  }

  const seen = new Set<string>();
  const slugs: string[] = [];
  for (const row of data ?? []) {
    const slug = (row as { slug?: string | null }).slug;
    if (typeof slug === 'string' && slug && !seen.has(slug)) {
      seen.add(slug);
      slugs.push(slug);
    }
  }
  return slugs;
};
