export type CreditCard = {
  id: string;
  name: string;
  issuer: string | null;
  last_four: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateCreditCardInput = {
  name: string;
  issuer?: string | null;
  last_four?: string | null;
};

export type UpdateCreditCardInput = {
  name?: string;
  issuer?: string | null;
  last_four?: string | null;
};
