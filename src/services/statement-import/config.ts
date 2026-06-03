/** Common CSV header aliases mapped to internal field keys. */
export const CSV_COLUMN_ALIASES: Record<string, string[]> = {
  posted_on: [
    'date',
    'posted date',
    'posting date',
    'transaction date',
    'trans. date',
    'trans date',
    'posted_on',
  ],
  amount_cents: ['amount', 'transaction amount', 'amount_cents'],
  debit: ['debit', 'charges', 'charge', 'purchase', 'purchases', 'sales'],
  credit: ['credit', 'credits', 'payments', 'payment'],
  description: [
    'description',
    'transaction description',
    'memo',
    'payee',
    'name',
    'details',
    'merchant',
    'merchant name',
  ],
};

export const normalizeDescription = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, ' ');
