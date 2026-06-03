import type { SupabaseClient } from '@supabase/supabase-js';
import { getAllCategories } from '../../data/categories';
import type { Category } from '../../data/categories/types';
import { getAllTransactions } from '../../data/transactions';
import type { Transaction } from '../../data/transactions/types';
import {
  processAssignTransactionCategory,
  type AssignCategoryResult,
} from './process-assign-transaction-category';

export const DEFAULT_BATCH_ASSIGN_CATEGORY_LIMIT = 25;

export type BatchAssignCategoriesInput = {
  transaction_ids?: string[];
  only_uncategorized?: boolean;
  /** When set (without transaction_ids), only transactions whose category_id is in this list. */
  category_ids?: string[];
  force?: boolean;
  limit?: number;
  system_prompt_override?: string;
};

export type BatchAssignCategoriesResult = {
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  categories_created: number;
  total_matching: number;
  remaining: number;
  results: AssignCategoryResult[];
  errors: { transaction_id: string; error: string }[];
};

/**
 * Assigns categories to multiple transactions in posted_on order.
 */
export const processAssignTransactionCategoriesBatch = async (
  supabase: SupabaseClient,
  input: BatchAssignCategoriesInput,
): Promise<BatchAssignCategoriesResult> => {
  let transactions: Transaction[];

  if (input.transaction_ids?.length) {
    const ids = new Set(input.transaction_ids);
    const all = await getAllTransactions(supabase, {});
    transactions = all.filter((t) => ids.has(t.id));
  } else {
    const all = await getAllTransactions(supabase, {});
    if (input.only_uncategorized) {
      transactions = all.filter((t) => !t.category_id);
    } else if (input.category_ids?.length) {
      const categoryIdSet = new Set(input.category_ids);
      transactions = all.filter(
        (t) => t.category_id != null && categoryIdSet.has(t.category_id),
      );
    } else {
      transactions = all;
    }
  }

  // Assign mode (force=false): never batch already-categorized rows — they would
  // be skipped one-by-one while remaining counts down on the full ID list.
  if (!input.force || input.only_uncategorized) {
    transactions = transactions.filter((t) => !t.category_id);
  }

  transactions.sort((a, b) => a.posted_on.localeCompare(b.posted_on));

  const totalMatching = transactions.length;
  const limit =
    input.limit !== undefined && input.limit > 0
      ? input.limit
      : DEFAULT_BATCH_ASSIGN_CATEGORY_LIMIT;
  const batch = transactions.slice(0, limit);
  const remaining = Math.max(0, totalMatching - batch.length);

  console.log(
    `[category-assign batch] start total=${totalMatching} this_batch=${batch.length} remaining_after=${remaining}`,
  );

  if (batch.length === 0) {
    console.log('[category-assign batch] done (nothing to process)');
    return {
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      categories_created: 0,
      total_matching: 0,
      remaining: 0,
      results: [],
      errors: [],
    };
  }

  let categories: Category[] = await getAllCategories(supabase);
  const results: AssignCategoryResult[] = [];
  const errors: { transaction_id: string; error: string }[] = [];
  let succeeded = 0;
  let failed = 0;
  let skipped = 0;
  let categoriesCreated = 0;

  for (let i = 0; i < batch.length; i += 1) {
    const txn = batch[i];
    console.log(
      `[category-assign batch] ${i + 1}/${batch.length} transaction=${txn.id} posted_on=${txn.posted_on}`,
    );
    try {
      const result = await processAssignTransactionCategory(supabase, txn.id, {
        force: input.force,
        existingCategoriesOverride: categories,
        systemPromptOverride: input.system_prompt_override,
      });
      results.push(result);
      if (result.skipped) {
        skipped += 1;
      } else {
        succeeded += 1;
        if (result.category_created) {
          categoriesCreated += 1;
          categories = await getAllCategories(supabase);
        }
      }
      console.log(
        `[category-assign batch] ${i + 1}/${batch.length} ok category=${result.category_name} skipped=${result.skipped}`,
      );
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : 'Unknown error';
      errors.push({ transaction_id: txn.id, error: message });
      console.error(`[category-assign batch] ${i + 1}/${batch.length} failed:`, message);
    }
  }

  console.log(
    `[category-assign batch] done processed=${batch.length} succeeded=${succeeded} failed=${failed} categories_created=${categoriesCreated} remaining=${remaining}`,
  );

  return {
    processed: batch.length,
    succeeded,
    failed,
    skipped,
    categories_created: categoriesCreated,
    total_matching: totalMatching,
    remaining,
    results,
    errors,
  };
};
