import type { SupabaseClient } from '@supabase/supabase-js';
import type { AnticipatedCost, CreateAnticipatedCostInput } from './types';
import { ANTICIPATED_COST_STATUSES } from './types';
import { normalizeAnticipatedTimeframe } from '../../utils/anticipated/normalize-timeframe';

const isValidDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);

/**
 * Creates a planned anticipated cost.
 */
export const createAnticipatedCost = async (
  supabase: SupabaseClient,
  input: CreateAnticipatedCostInput,
): Promise<AnticipatedCost> => {
  const name = input.name?.trim() ?? '';
  if (!name) {
    throw new Error('name is required');
  }

  if (!Number.isFinite(input.amount_cents) || input.amount_cents < 0) {
    throw new Error('amount_cents must be a non-negative number');
  }

  const dueOn = input.due_on?.trim() ?? '';
  if (!isValidDate(dueOn)) {
    throw new Error('due_on must be YYYY-MM-DD');
  }

  const status = input.status ?? 'planned';
  if (!ANTICIPATED_COST_STATUSES.includes(status)) {
    throw new Error('invalid status');
  }

  const timeframe = normalizeAnticipatedTimeframe(
    input.timeframe_interval,
    input.timeframe_count,
    input.timeframe_every,
  );

  const { data, error } = await supabase
    .from('anticipated_costs')
    .insert({
      name,
      amount_cents: Math.round(input.amount_cents),
      due_on: dueOn,
      category_id: input.category_id ?? null,
      notes: input.notes?.trim() || null,
      timeframe_interval: timeframe.timeframe_interval,
      timeframe_every: timeframe.timeframe_every,
      timeframe_count: timeframe.timeframe_count,
      status,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create anticipated cost: ${error.message}`);
  }

  return data as AnticipatedCost;
};
