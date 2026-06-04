import type { SupabaseClient } from '@supabase/supabase-js';
import type { AnticipatedCost, UpdateAnticipatedCostInput } from './types';
import { ANTICIPATED_COST_STATUSES } from './types';
import { normalizeAnticipatedTimeframe } from '../../utils/anticipated/normalize-timeframe';

const isValidDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);

/**
 * Updates an anticipated cost.
 */
export const updateAnticipatedCost = async (
  supabase: SupabaseClient,
  id: string,
  input: UpdateAnticipatedCostInput,
): Promise<AnticipatedCost> => {
  const patch: Record<string, string | number | null> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) throw new Error('name cannot be empty');
    patch.name = name;
  }

  if (input.amount_cents !== undefined) {
    if (!Number.isFinite(input.amount_cents) || input.amount_cents < 0) {
      throw new Error('amount_cents must be a non-negative number');
    }
    patch.amount_cents = Math.round(input.amount_cents);
  }

  if (input.due_on !== undefined) {
    const dueOn = input.due_on.trim();
    if (!isValidDate(dueOn)) throw new Error('due_on must be YYYY-MM-DD');
    patch.due_on = dueOn;
  }

  if (input.category_id !== undefined) {
    patch.category_id = input.category_id;
  }

  if (input.notes !== undefined) {
    patch.notes = input.notes?.trim() || null;
  }

  if (input.status !== undefined) {
    if (!ANTICIPATED_COST_STATUSES.includes(input.status)) {
      throw new Error('invalid status');
    }
    patch.status = input.status;
  }

  if (
    input.timeframe_interval !== undefined ||
    input.timeframe_count !== undefined ||
    input.timeframe_every !== undefined
  ) {
    const timeframe = normalizeAnticipatedTimeframe(
      input.timeframe_interval,
      input.timeframe_count,
      input.timeframe_every,
    );
    patch.timeframe_interval = timeframe.timeframe_interval;
    patch.timeframe_every = timeframe.timeframe_every;
    patch.timeframe_count = timeframe.timeframe_count;
  }

  const { data, error } = await supabase
    .from('anticipated_costs')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update anticipated cost: ${error.message}`);
  }

  return data as AnticipatedCost;
};
