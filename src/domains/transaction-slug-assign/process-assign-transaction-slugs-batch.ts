import type { SupabaseClient } from '@supabase/supabase-js';
import { getAllTransactions } from '../../data/transactions';
import type { Transaction } from '../../data/transactions/types';
import { getDistinctTransactionSlugs } from '../../data/transactions/get-distinct-slugs';
import {
  processAssignTransactionSlug,
  type AssignSlugResult,
} from './process-assign-transaction-slug';

export const DEFAULT_BATCH_ASSIGN_SLUG_LIMIT = 25;

export type BatchAssignSlugsInput = {
  transaction_ids?: string[];
  only_unslagged?: boolean;
  force?: boolean;
  /** Max transactions to process this request (default 25). */
  limit?: number;
};

export type BatchAssignSlugsResult = {
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  total_matching: number;
  remaining: number;
  results: AssignSlugResult[];
  errors: { transaction_id: string; error: string }[];
};

/**
 * Assigns slugs to multiple transactions in posted_on order.
 */
export const processAssignTransactionSlugsBatch = async (
  supabase: SupabaseClient,
  input: BatchAssignSlugsInput,
): Promise<BatchAssignSlugsResult> => {
  let transactions: Transaction[];

  if (input.transaction_ids?.length) {
    const ids = new Set(input.transaction_ids);
    const all = await getAllTransactions(supabase, {});
    transactions = all.filter((t) => ids.has(t.id));
  } else {
    const all = await getAllTransactions(supabase, {});
    transactions = input.only_unslagged ? all.filter((t) => !t.slug) : all;
  }

  transactions.sort((a, b) => a.posted_on.localeCompare(b.posted_on));

  const totalMatching = transactions.length;
  const limit =
    input.limit !== undefined && input.limit > 0
      ? input.limit
      : DEFAULT_BATCH_ASSIGN_SLUG_LIMIT;
  const batch = transactions.slice(0, limit);
  const remaining = Math.max(0, totalMatching - batch.length);

  console.log(
    `[slug-assign batch] start total=${totalMatching} this_batch=${batch.length} remaining_after=${remaining}`,
  );

  if (batch.length === 0) {
    console.log('[slug-assign batch] done (nothing to process)');
    return {
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      total_matching: 0,
      remaining: 0,
      results: [],
      errors: [],
    };
  }

  const slugSet = new Set(await getDistinctTransactionSlugs(supabase));
  const results: AssignSlugResult[] = [];
  const errors: { transaction_id: string; error: string }[] = [];
  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < batch.length; i += 1) {
    const txn = batch[i];
    console.log(
      `[slug-assign batch] ${i + 1}/${batch.length} transaction=${txn.id} posted_on=${txn.posted_on}`,
    );
    try {
      const result = await processAssignTransactionSlug(supabase, txn.id, {
        force: input.force,
        existingSlugsOverride: [...slugSet],
      });
      results.push(result);
      if (result.skipped) {
        skipped += 1;
        if (result.slug) slugSet.add(result.slug);
      } else {
        succeeded += 1;
        slugSet.add(result.slug);
      }
      console.log(
        `[slug-assign batch] ${i + 1}/${batch.length} ok slug=${result.slug} skipped=${result.skipped}`,
      );
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : 'Unknown error';
      errors.push({ transaction_id: txn.id, error: message });
      console.error(`[slug-assign batch] ${i + 1}/${batch.length} failed:`, message);
    }
  }

  console.log(
    `[slug-assign batch] done processed=${batch.length} succeeded=${succeeded} failed=${failed} skipped=${skipped} remaining=${remaining}`,
  );

  return {
    processed: batch.length,
    succeeded,
    failed,
    skipped,
    total_matching: totalMatching,
    remaining,
    results,
    errors,
  };
};
