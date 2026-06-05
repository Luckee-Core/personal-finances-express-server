import type { SupabaseClient } from '@supabase/supabase-js';
import { upsertNotRecurringBySlug } from '../../data/not-recurring';
import type { NotRecurring } from '../../data/not-recurring/types';
import { deleteRecurringPurchase } from '../../data/recurring-purchases/delete';
import { getRecurringPurchaseById } from '../../data/recurring-purchases/get-by-id';
import { getAllTransactions } from '../../data/transactions';

export type MarkNotRecurringResult = {
  not_recurring: NotRecurring;
  slug: string;
};

/**
 * Deletes a recurring purchase and records its slug as not recurring for AI detection.
 */
export const processMarkNotRecurring = async (
  supabase: SupabaseClient,
  recurringPurchaseId: string,
): Promise<MarkNotRecurringResult> => {
  console.log('🚀 processMarkNotRecurring', recurringPurchaseId);

  const purchase = await getRecurringPurchaseById(supabase, recurringPurchaseId);
  if (!purchase) {
    throw new Error('Recurring purchase not found');
  }

  let slug = purchase.vendor?.trim().toLowerCase() ?? '';
  if (!slug) {
    const transactions = await getAllTransactions(supabase, {});
    for (const txn of transactions) {
      if (txn.recurring_purchase_id !== recurringPurchaseId) continue;
      const txnSlug = txn.slug?.trim().toLowerCase();
      if (txnSlug) {
        slug = txnSlug;
        break;
      }
    }
  }

  if (!slug) {
    throw new Error(
      'Cannot mark as not recurring: no slug on vendor or linked transactions',
    );
  }

  const notRecurring = await upsertNotRecurringBySlug(supabase, {
    slug,
    notes: `Marked not recurring (was: ${purchase.name})`,
  });

  await deleteRecurringPurchase(supabase, recurringPurchaseId);

  console.log('✅ processMarkNotRecurring', slug);
  return { not_recurring: notRecurring, slug };
};
