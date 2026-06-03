import type { Category } from '../../data/categories/types';
import type { Transaction } from '../../data/transactions/types';

export type AssignCategoryUserPayload = {
  transaction: {
    id: string;
    posted_on: string;
    amount_cents: number;
    description: string;
    bank_account_name: string | null;
  };
  existing_categories: { id: string; name: string }[];
  assignment_mode?: 'assign' | 'recategorize';
  previous_category_name?: string | null;
  recategorize_note?: string | null;
};

export type BuildAssignCategoryUserMessageOptions = {
  bankAccountName?: string | null;
  recategorize?: boolean;
  previousCategoryName?: string | null;
  recategorizeNote?: string | null;
};

/**
 * Builds the JSON user message for category assignment.
 */
export const buildAssignCategoryUserMessage = (
  transaction: Transaction,
  existingCategories: Category[],
  options: BuildAssignCategoryUserMessageOptions = {},
): string => {
  const payload: AssignCategoryUserPayload = {
    transaction: {
      id: transaction.id,
      posted_on: transaction.posted_on,
      amount_cents: transaction.amount_cents,
      description: transaction.description,
      bank_account_name: options.bankAccountName?.trim() || null,
    },
    existing_categories: existingCategories.map((c) => ({ id: c.id, name: c.name })),
  };

  if (options.recategorize) {
    payload.assignment_mode = 'recategorize';
    payload.previous_category_name = options.previousCategoryName?.trim() || null;
  }
  if (options.recategorizeNote?.trim()) {
    payload.recategorize_note = options.recategorizeNote.trim();
  }

  return JSON.stringify(payload);
};
