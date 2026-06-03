export type BankAccount = {
  id: string;
  name: string;
  account_type: string;
  created_at: string;
  updated_at: string;
};

export type CreateBankAccountInput = {
  name: string;
  account_type?: string;
};

export type UpdateBankAccountInput = {
  name?: string;
  account_type?: string;
};
