import type { Transaction } from '../../data/transactions/types';

/** Keep memos short — full ledger payloads can be 300+ rows. */
const MEMO_MAX_CHARS = 160;

const truncateMemo = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.length <= MEMO_MAX_CHARS) return trimmed;
  return `${trimmed.slice(0, MEMO_MAX_CHARS)}…`;
};

export type RecurringDetectTransactionRow = {
  id: string;
  posted_on: string;
  description: string;
  slug: string;
  amount_cents: number;
};

export type RecurringDetectAllUserPayload = {
  transaction_count: number;
  transactions: RecurringDetectTransactionRow[];
  /** Slugs the user marked as never recurring — do not classify these. */
  not_recurring_slugs: string[];
};

/**
 * Builds compact JSON for a single full-ledger recurring detect call.
 */
export const buildRecurringDetectAllUserMessage = (
  transactions: Transaction[],
  notRecurringSlugs: string[] = [],
): string => {
  const rows: RecurringDetectTransactionRow[] = [];

  for (const txn of transactions) {
    const slug = txn.slug?.trim().toLowerCase();
    if (!slug) continue;
    rows.push({
      id: txn.id,
      posted_on: txn.posted_on,
      description: truncateMemo(txn.description),
      slug,
      amount_cents: txn.amount_cents,
    });
  }

  rows.sort((a, b) => a.posted_on.localeCompare(b.posted_on) || a.slug.localeCompare(b.slug));

  const payload: RecurringDetectAllUserPayload = {
    transaction_count: rows.length,
    transactions: rows,
    not_recurring_slugs: [...new Set(notRecurringSlugs.map((s) => s.trim().toLowerCase()).filter(Boolean))].sort(),
  };

  return JSON.stringify(payload);
};
