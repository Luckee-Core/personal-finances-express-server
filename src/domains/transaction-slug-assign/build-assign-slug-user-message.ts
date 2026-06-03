import type { Transaction } from '../../data/transactions/types';

export type AssignSlugUserPayload = {
  transaction: {
    id: string;
    posted_on: string;
    amount_cents: number;
    description: string;
    bank_account_name: string | null;
  };
  existing_slugs: string[];
};

/**
 * Builds the JSON user message for slug assignment.
 */
export const buildAssignSlugUserMessage = (
  transaction: Transaction,
  existingSlugs: string[],
  bankAccountName?: string | null,
): string => {
  const payload: AssignSlugUserPayload = {
    transaction: {
      id: transaction.id,
      posted_on: transaction.posted_on,
      amount_cents: transaction.amount_cents,
      description: transaction.description,
      bank_account_name: bankAccountName?.trim() || null,
    },
    existing_slugs: existingSlugs,
  };
  return JSON.stringify(payload);
};
