import type { Request } from 'express';
import type { TransactionListFilters, TransactionSource } from '../../data/transactions/types';

/**
 * Parses transaction list query filters from the request.
 */
export const parseTransactionFilters = (query: Request['query']): TransactionListFilters => {
  const filters: TransactionListFilters = {};
  const bankAccountId = query.bankAccountId;
  const categoryId = query.categoryId;
  const source = query.source;
  const fromDate = query.fromDate;
  const toDate = query.toDate;

  if (typeof bankAccountId === 'string' && bankAccountId) {
    filters.bankAccountId = bankAccountId;
  }
  if (typeof categoryId === 'string' && categoryId) {
    filters.categoryId = categoryId;
  }
  if (typeof source === 'string' && (source === 'manual' || source === 'import')) {
    filters.source = source as TransactionSource;
  }
  if (typeof fromDate === 'string' && fromDate) {
    filters.fromDate = fromDate;
  }
  if (typeof toDate === 'string' && toDate) {
    filters.toDate = toDate;
  }

  return filters;
};
