import type { SupabaseClient } from '@supabase/supabase-js';
import { getAllTransactions } from '../../data/transactions';
import { groupTransactionsBySlug } from './group-transactions-by-slug';
import {
  processDetectRecurringForSlug,
  type DetectRecurringForSlugResult,
} from './process-detect-recurring-for-slug';

export const DEFAULT_RECURRING_DETECT_BATCH_LIMIT = 5;

export type DetectRecurringBatchInput = {
  slugs?: string[];
  min_transactions?: number;
  only_unlinked?: boolean;
  create_recurring?: boolean;
  limit?: number;
};

export type DetectRecurringBatchResult = {
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  recurring_found: number;
  total_matching: number;
  remaining: number;
  results: DetectRecurringForSlugResult[];
  errors: { slug: string; error: string }[];
};

/**
 * Detects recurring patterns for transaction groups keyed by slug.
 */
export const processDetectRecurringBatch = async (
  supabase: SupabaseClient,
  input: DetectRecurringBatchInput,
): Promise<DetectRecurringBatchResult> => {
  const minTransactions = input.min_transactions ?? 2;
  const all = await getAllTransactions(supabase, {});
  let groups = groupTransactionsBySlug(all).filter(
    (g) => g.transactions.length >= minTransactions,
  );

  if (input.slugs?.length) {
    const slugSet = new Set(input.slugs.map((s) => s.trim().toLowerCase()));
    groups = groups.filter((g) => slugSet.has(g.slug));
  }

  if (input.only_unlinked) {
    groups = groups.filter((g) =>
      g.transactions.some((t) => !t.recurring_purchase_id),
    );
  }

  const totalMatching = groups.length;
  const limit =
    input.limit !== undefined && input.limit > 0
      ? input.limit
      : DEFAULT_RECURRING_DETECT_BATCH_LIMIT;
  const batch = groups.slice(0, limit);
  const remaining = Math.max(0, totalMatching - batch.length);

  console.log(
    `[recurring-detect batch] start total=${totalMatching} this_batch=${batch.length} remaining_after=${remaining}`,
  );

  const results: DetectRecurringForSlugResult[] = [];
  const errors: { slug: string; error: string }[] = [];
  let succeeded = 0;
  let failed = 0;
  let skipped = 0;
  let recurringFound = 0;

  for (let i = 0; i < batch.length; i += 1) {
    const group = batch[i];
    console.log(
      `[recurring-detect batch] ${i + 1}/${batch.length} slug=${group.slug} txns=${group.transactions.length}`,
    );
    try {
      const result = await processDetectRecurringForSlug(
        supabase,
        group.slug,
        group.transactions,
        {
          create_recurring: input.create_recurring,
          min_transactions: minTransactions,
        },
      );
      results.push(result);
      if (result.skipped) {
        skipped += 1;
      } else {
        succeeded += 1;
        if (result.is_recurring) recurringFound += 1;
      }
      console.log(
        `[recurring-detect batch] ${i + 1}/${batch.length} ok is_recurring=${result.is_recurring} skipped=${result.skipped}`,
      );
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : 'Unknown error';
      errors.push({ slug: group.slug, error: message });
      console.error(`[recurring-detect batch] ${i + 1}/${batch.length} failed:`, message);
    }
  }

  console.log(
    `[recurring-detect batch] done processed=${batch.length} recurring_found=${recurringFound} failed=${failed} remaining=${remaining}`,
  );

  return {
    processed: batch.length,
    succeeded,
    failed,
    skipped,
    recurring_found: recurringFound,
    total_matching: totalMatching,
    remaining,
    results,
    errors,
  };
};
