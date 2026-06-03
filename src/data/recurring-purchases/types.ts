export type BillingInterval = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export type RecurringPurchase = {
  id: string;
  name: string;
  vendor: string | null;
  amount_cents: number;
  billing_interval: BillingInterval;
  interval_months: number | null;
  currency: string;
  started_at: string;
  next_due_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateRecurringPurchaseInput = {
  name: string;
  vendor?: string | null;
  amount_cents: number;
  billing_interval?: BillingInterval;
  interval_months?: number | null;
  currency?: string;
  started_at?: string;
  next_due_at?: string | null;
  ends_at?: string | null;
  is_active?: boolean;
  notes?: string | null;
};

export type UpdateRecurringPurchaseInput = Partial<CreateRecurringPurchaseInput>;
