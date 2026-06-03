import { parse } from 'csv-parse/sync';
import { CSV_COLUMN_ALIASES } from './config';

export type ParsedCsvRow = {
  posted_on: string;
  amount_cents: number;
  description: string;
};

const normalizeHeaderLabel = (header: string): string =>
  header
    .trim()
    .toLowerCase()
    .replace(/\s*\([^)]*\)\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const findColumnKey = (headers: string[], field: keyof typeof CSV_COLUMN_ALIASES): string | null => {
  const normalizedHeaders = headers.map((h) => normalizeHeaderLabel(h));
  const aliases = CSV_COLUMN_ALIASES[field].map((a) => a.toLowerCase());
  for (let i = 0; i < normalizedHeaders.length; i += 1) {
    if (aliases.includes(normalizedHeaders[i])) {
      return headers[i];
    }
  }
  return null;
};

const parseAmountToCents = (raw: string): number | null => {
  const cleaned = raw.replace(/[$,]/g, '').trim();
  if (!cleaned) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return null;
  return Math.round(value * 100);
};

const parseDate = (raw: string): string | null => {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
};

const parseAmountFromRecord = (
  record: Record<string, string>,
  headers: string[],
): number | null => {
  const amountKey = findColumnKey(headers, 'amount_cents');
  if (amountKey) {
    const raw = (record[amountKey] ?? '').trim();
    if (raw) {
      const cents = parseAmountToCents(raw);
      if (cents !== null) return cents;
    }
  }

  const debitKey = findColumnKey(headers, 'debit');
  const creditKey = findColumnKey(headers, 'credit');
  const debitRaw = debitKey ? (record[debitKey] ?? '').trim() : '';
  const creditRaw = creditKey ? (record[creditKey] ?? '').trim() : '';

  if (debitRaw) {
    const debitCents = parseAmountToCents(debitRaw);
    if (debitCents !== null) return Math.abs(debitCents);
  }
  if (creditRaw) {
    const creditCents = parseAmountToCents(creditRaw);
    if (creditCents !== null) return -Math.abs(creditCents);
  }

  return null;
};

/**
 * Parse CSV buffer into normalized transaction rows.
 */
export const parseCsvRows = (fileBuffer: Buffer): ParsedCsvRow[] => {
  const records = parse(fileBuffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  if (records.length === 0) {
    return [];
  }

  const headers = Object.keys(records[0]);
  const dateKey = findColumnKey(headers, 'posted_on');
  const amountKey = findColumnKey(headers, 'amount_cents');
  const debitKey = findColumnKey(headers, 'debit');
  const creditKey = findColumnKey(headers, 'credit');
  const descriptionKey = findColumnKey(headers, 'description');

  if (!dateKey || !descriptionKey || (!amountKey && !debitKey && !creditKey)) {
    throw new Error(
      'CSV must include date, description, and amount (or separate debit/credit columns). Common bank and card export headers are supported.',
    );
  }

  const rows: ParsedCsvRow[] = [];

  for (const record of records) {
    const postedOn = parseDate(record[dateKey] ?? '');
    const amountCents = parseAmountFromRecord(record, headers);
    const description = (record[descriptionKey] ?? '').trim();

    if (!postedOn || amountCents === null) {
      continue;
    }

    rows.push({
      posted_on: postedOn,
      amount_cents: amountCents,
      description: description || 'Imported transaction',
    });
  }

  return rows;
};
