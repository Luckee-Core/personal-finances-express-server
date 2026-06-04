export type Loan = {
  id: string;
  name: string;
  loan_vendor_id: string | null;
  balance_cents: number;
  monthly_payment_cents: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateLoanInput = {
  name: string;
  loan_vendor_id?: string | null;
  balance_cents: number;
  monthly_payment_cents: number;
  is_active?: boolean;
  notes?: string | null;
};

export type UpdateLoanInput = {
  name?: string;
  loan_vendor_id?: string | null;
  balance_cents?: number;
  monthly_payment_cents?: number;
  is_active?: boolean;
  notes?: string | null;
};
