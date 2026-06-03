import type { Transaction } from '../../data/transactions/types';

export type SlugTransactionGroup = {
  slug: string;
  transactions: Transaction[];
};

/**
 * Groups transactions that have a non-empty slug.
 */
export const groupTransactionsBySlug = (transactions: Transaction[]): SlugTransactionGroup[] => {
  const bySlug = new Map<string, Transaction[]>();

  for (const txn of transactions) {
    const slug = txn.slug?.trim().toLowerCase();
    if (!slug) continue;
    const list = bySlug.get(slug) ?? [];
    list.push(txn);
    bySlug.set(slug, list);
  }

  return [...bySlug.entries()]
    .map(([slug, txns]) => ({
      slug,
      transactions: txns.sort((a, b) => a.posted_on.localeCompare(b.posted_on)),
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
};
