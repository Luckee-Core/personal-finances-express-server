export type AnticipatedCostStatus = 'planned' | 'completed' | 'cancelled';

export const ANTICIPATED_COST_STATUSES: AnticipatedCostStatus[] = [
  'planned',
  'completed',
  'cancelled',
];

export type AnticipatedTimeframeInterval = 'weekly' | 'monthly' | 'yearly';

export type AnticipatedCost = {
  id: string;
  name: string;
  amount_cents: number;
  due_on: string;
  category_id: string | null;
  notes: string | null;
  timeframe_interval: AnticipatedTimeframeInterval | null;
  timeframe_every: number | null;
  timeframe_count: number | null;
  status: AnticipatedCostStatus;
  created_at: string;
  updated_at: string;
};

export type CreateAnticipatedCostInput = {
  name: string;
  amount_cents: number;
  due_on: string;
  category_id?: string | null;
  notes?: string | null;
  timeframe_interval?: AnticipatedTimeframeInterval | null;
  timeframe_every?: number | null;
  timeframe_count?: number | null;
  status?: AnticipatedCostStatus;
};

export type UpdateAnticipatedCostInput = {
  name?: string;
  amount_cents?: number;
  due_on?: string;
  category_id?: string | null;
  notes?: string | null;
  timeframe_interval?: AnticipatedTimeframeInterval | null;
  timeframe_every?: number | null;
  timeframe_count?: number | null;
  status?: AnticipatedCostStatus;
};
