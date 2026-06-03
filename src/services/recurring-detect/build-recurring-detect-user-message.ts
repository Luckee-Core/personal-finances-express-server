import type { Transaction } from '../../data/transactions/types';

export type RecurringDetectUserPayload = {
  slug: string;
  transactions: {
    id: string;
    posted_on: string;
    amount_cents: number;
    description: string;
  }[];
};

/**
 * Builds the JSON user message for recurring detection on one slug group.
 */
export const buildRecurringDetectUserMessage = (
  slug: string,
  transactions: Transaction[],
): string => {
  const payload: RecurringDetectUserPayload = {
    slug,
    transactions: transactions.map((t) => ({
      id: t.id,
      posted_on: t.posted_on,
      amount_cents: t.amount_cents,
      description: t.description,
    })),
  };
  return JSON.stringify(payload);
};
