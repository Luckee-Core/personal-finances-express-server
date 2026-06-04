export type AnticipatedTimeframeInterval = 'weekly' | 'monthly' | 'yearly';

const INTERVALS: AnticipatedTimeframeInterval[] = ['weekly', 'monthly', 'yearly'];
const MIN_COUNT = 1;
const MAX_COUNT = 600;
const MIN_EVERY = 1;
const MAX_EVERY = 52;

export type NormalizedAnticipatedTimeframe = {
  timeframe_interval: AnticipatedTimeframeInterval | null;
  timeframe_every: number | null;
  timeframe_count: number | null;
};

/**
 * Normalizes schedule fields: all null for a single due date, or interval + every + count together.
 */
export const normalizeAnticipatedTimeframe = (
  interval: string | null | undefined,
  count: number | null | undefined,
  every: number | null | undefined,
): NormalizedAnticipatedTimeframe => {
  const hasInterval = interval != null && String(interval).trim() !== '';
  const hasCount = count != null && Number.isFinite(count);
  const hasEvery = every != null && Number.isFinite(every);

  if (!hasInterval && !hasCount && !hasEvery) {
    return {
      timeframe_interval: null,
      timeframe_every: null,
      timeframe_count: null,
    };
  }

  if (!hasInterval || !hasCount) {
    throw new Error(
      'timeframe_interval and timeframe_count must both be set or all schedule fields empty',
    );
  }

  const normalized = interval.trim().toLowerCase();
  if (!INTERVALS.includes(normalized as AnticipatedTimeframeInterval)) {
    throw new Error('timeframe_interval must be weekly, monthly, or yearly');
  }

  const periods = Math.round(count);
  if (periods < MIN_COUNT || periods > MAX_COUNT) {
    throw new Error(`timeframe_count must be between ${MIN_COUNT} and ${MAX_COUNT}`);
  }

  const step = hasEvery ? Math.round(every) : 1;
  if (step < MIN_EVERY || step > MAX_EVERY) {
    throw new Error(`timeframe_every must be between ${MIN_EVERY} and ${MAX_EVERY}`);
  }

  return {
    timeframe_interval: normalized as AnticipatedTimeframeInterval,
    timeframe_every: step,
    timeframe_count: periods,
  };
};
